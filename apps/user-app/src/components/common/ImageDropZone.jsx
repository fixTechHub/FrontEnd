import React, { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';

const ImageDropZone = ({ 
    onFileSelect, 
    currentFile, 
    onRemove, 
    label = "Upload ảnh",
    accept = "image/*",
    maxSize = 5 * 1024 * 1024, // 5MB
    onOCRResult = null, // Callback for OCR result
    showSelectButton = true // Whether to render the "Chọn file" button
}) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize preview URL when currentFile changes
    React.useEffect(() => {
        if (currentFile) {
            if (currentFile instanceof File) {
                const url = URL.createObjectURL(currentFile);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            } else if (typeof currentFile === 'string') {
                setPreviewUrl(currentFile);
            }
        } else {
            setPreviewUrl(null);
        }
    }, [currentFile]);

    const validateFile = (file) => {
        if (!file.type.startsWith('image/')) {
            throw new Error('Chỉ chấp nhận file ảnh');
        }
        if (file.size > maxSize) {
            throw new Error(`File quá lớn. Tối đa ${Math.round(maxSize / 1024 / 1024)}MB`);
        }
        return true;
    };

    const handleFile = async (file) => {
        try {
            validateFile(file);
            setIsProcessing(true);
            
            console.log('[ImageDropZone] Processing new file:', file.name, 'Size:', file.size);
            
            // Call the parent callback first
            onFileSelect(file);
            
            // If OCR callback is provided, perform OCR with timeout
            if (onOCRResult && file) {
                console.log('[ImageDropZone] Starting OCR for:', file.name);
                
                // Set timeout for OCR (30 seconds max)
                const ocrTimeout = setTimeout(() => {
                    console.warn('[ImageDropZone] OCR timeout after 30 seconds');
                    onOCRResult(null);
                }, 30000);
                
                try {
                    const result = await performOCR(file);
                    clearTimeout(ocrTimeout);
                    console.log('[ImageDropZone] OCR completed successfully:', result);
                    onOCRResult(result);
                } catch (ocrError) {
                    clearTimeout(ocrTimeout);
                    console.warn('[ImageDropZone] OCR failed:', ocrError.message);
                    onOCRResult(null); // Notify parent that OCR failed
                }
            } else {
                console.log('[ImageDropZone] No OCR callback provided');
            }
        } catch (error) {
            console.error('[ImageDropZone] File handling error:', error);
            alert(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    // Extract CCCD number from OCR text using multiple regex patterns
    const extractCCCDNumber = (text) => {
        console.log('[OCR] Raw text from image:', text);
        
        // Clean the text and normalize it
        const normalizedText = text
            .replace(/[^\d\s\-\.]/g, ' ')  // Keep digits, spaces, dashes, dots
            .replace(/\s+/g, ' ')          // Normalize spaces
            .trim();
        console.log('[OCR] Normalized text:', normalizedText);
        
        // Multiple patterns to catch different CCCD formats
        const patterns = [
            // Pattern 1: Exactly 12 consecutive digits
            /\b\d{12}\b/g,
            
            // Pattern 2: 12 digits with spaces or dashes (XXX XXX XXX XXX)
            /\b\d{3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3}\b/g,
            
            // Pattern 3: 12 digits with dots (XXX.XXX.XXX.XXX)
            /\b\d{3}\.?\d{3}\.?\d{3}\.?\d{3}\b/g,
            
            // Pattern 4: Mixed separators
            /\b\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{3}[\s\-\.]?\d{3}\b/g,
            
            // Pattern 5: Individual digit extraction (fallback)
            /\d/g
        ];
        
        // Try each pattern
        for (let i = 0; i < patterns.length - 1; i++) {
            const pattern = patterns[i];
            const matches = normalizedText.match(pattern);
            
            if (matches && matches.length > 0) {
                for (const match of matches) {
                    const cleanNumber = match.replace(/[\s\-\.]/g, '');
                    
                    // Validate if it's exactly 12 digits and looks like valid CCCD
                    if (cleanNumber.length === 12 && /^\d{12}$/.test(cleanNumber)) {
                        // Basic CCCD validation
                        const locationCode = cleanNumber.substring(0, 3);
                        const genderCentury = cleanNumber.substring(3, 5);
                        
                        // Location code should be between 001-096
                        const locCode = parseInt(locationCode);
                        if (locCode >= 1 && locCode <= 96) {
                            console.log(`[OCR] Found valid CCCD with pattern ${i + 1}:`, cleanNumber);
                            return cleanNumber;
                        }
                    }
                }
            }
        }
        
        // Fallback: Extract all digits and try to find 12 consecutive ones
        const allDigits = normalizedText.match(/\d/g);
        if (allDigits && allDigits.length >= 12) {
            const digitString = allDigits.join('');
            
            // Look for 12-digit subsequences
            for (let i = 0; i <= digitString.length - 12; i++) {
                const candidate = digitString.substring(i, i + 12);
                const locationCode = parseInt(candidate.substring(0, 3));
                
                if (locationCode >= 1 && locationCode <= 96) {
                    console.log('[OCR] Found CCCD via digit extraction:', candidate);
                    return candidate;
                }
            }
        }
        
        console.log('[OCR] No valid CCCD number pattern found in text');
        return null;
    };

    const performOCR = async (file) => {
        console.log('[OCR] Starting real OCR with Tesseract.js for:', file.name);
        
        try {
            // Basic file validation
            if (file.size < 1000) { // < 1KB
                throw new Error('Ảnh quá nhỏ, không thể nhận diện CCCD');
            }
            
            if (file.size > 10000000) { // > 10MB
                throw new Error('Ảnh quá lớn, vui lòng sử dụng ảnh nhỏ hơn 10MB');
            }

            // Create Tesseract worker with simpler, more reliable settings
            console.log('[OCR] Creating Tesseract worker...');
            const worker = await createWorker(['eng', 'vie'], 1, {
                logger: m => console.log('[Tesseract]', m)
            });
            
            console.log('[OCR] Tesseract worker created, processing image...');
            
            // Perform OCR on the image with basic settings
            const { data: { text, confidence } } = await worker.recognize(file);
            console.log('[OCR] OCR confidence:', confidence);
            console.log('[OCR] Raw OCR text length:', text.length);
            
            console.log('[OCR] Tesseract completed, terminating worker...');
            await worker.terminate();
            
            // Check if we got meaningful text
            if (!text || text.trim().length < 5) {
                console.log('[OCR] OCR returned very little text, confidence too low');
                throw new Error('Ảnh không đủ rõ để nhận diện. Vui lòng chụp ảnh CCCD rõ nét hơn.');
            }

            // Extract CCCD number from the OCR text
            const cccdNumber = extractCCCDNumber(text);
            
            if (cccdNumber) {
                console.log('[OCR] Successfully extracted CCCD number:', cccdNumber);
                console.log('[OCR] Extraction confidence level: HIGH');
                return { cccdNumber };
            } else {
                console.log('[OCR] No CCCD found but text was extracted. Trying manual mode...');
                // If OCR worked but no CCCD found, give detailed guidance
                throw new Error(`Không tìm thấy số CCCD 12 chữ số trong ảnh. 
                
Đã nhận diện được text nhưng không có số CCCD hợp lệ.
Vui lòng:
- Chụp ảnh rõ nét, đầy đủ 4 góc CCCD
- Đảm bảo số CCCD không bị che khuất 
- Hoặc nhập thủ công số CCCD`);
            }
            
        } catch (error) {
            console.error('[OCR] Error during real OCR processing:', error);
            
            // More specific error messages
            if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Lỗi kết nối mạng khi tải OCR engine. Vui lòng kiểm tra internet và thử lại.');
            } else if (error.message.includes('worker') || error.message.includes('terminate')) {
                throw new Error('Lỗi khởi tạo OCR engine. Vui lòng tải lại trang và thử lại.');
            } else {
                throw new Error(error.message || 'Không thể nhận diện số CCCD từ ảnh. Vui lòng thử ảnh rõ nét hơn hoặc nhập thủ công.');
            }
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="position-relative">
            <label className="form-label fw-medium">{label}</label>
            <div
                className={`border border-2 border-dashed rounded-3 p-4 text-center position-relative overflow-hidden ${
                    isDragActive 
                        ? 'border-primary bg-primary bg-opacity-10' 
                        : currentFile 
                            ? 'border-success bg-success bg-opacity-5' 
                            : 'border-secondary bg-light'
                }`}
                style={{ 
                    minHeight: '200px',
                    cursor: currentFile ? 'default' : 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={!currentFile ? handleClick : undefined}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileInput}
                    className="d-none"
                />

                {isProcessing ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Đang xử lý...</span>
                        </div>
                        <p className="mb-0 text-muted">Đang xử lý ảnh và nhận diện...</p>
                    </div>
                ) : previewUrl ? (
                    <div className="position-relative">
                        <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '150px', objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 end-0 p-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-danger rounded-circle"
                                onClick={handleRemove}
                                style={{ width: '30px', height: '30px' }}
                            >
                                <i className="bi bi-x"></i>
                            </button>
                        </div>
                        <div className="mt-2">
                            <small className="text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Đã upload thành công
                            </small>
                        </div>
                    </div>
                ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                        <i className={`bi ${isDragActive ? 'bi-cloud-upload' : 'bi-upload'} fs-1 text-muted mb-3`}></i>
                        <h6 className="mb-2">
                            {isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
                        </h6>
                        <p className="mb-0 small text-muted">
                            Hỗ trợ: JPG, PNG, WEBP (tối đa {Math.round(maxSize / 1024 / 1024)}MB)
                        </p>
                        {showSelectButton && (
                            <button 
                                type="button" 
                                className="btn btn-outline-primary btn-sm mt-3"
                                onClick={handleClick}
                            >
                                <i className="bi bi-folder2-open me-2"></i>
                                Chọn file
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageDropZone;