import React, { useState, useEffect } from 'react';

const MAX_FILES = 5;

function ImageUploader({ onFilesSelect }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);

        const remainingSlots = MAX_FILES - selectedFiles.length;
        if (newFiles.length > remainingSlots) {
            alert(`Bạn chỉ có thể tải lên thêm ${remainingSlots} ảnh. Giới hạn tối đa là ${MAX_FILES} ảnh.`);
        }

        const filesToProcess = newFiles.slice(0, remainingSlots);

        const validFiles = filesToProcess.filter(file => {
            const isTypeValid = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type);

            if (!isTypeValid) {
                alert(`Định dạng file ${file.name} không được hỗ trợ. Vui lòng chỉ sử dụng ảnh JPEG, JPG, hoặc PNG.`);
            }
            return isTypeValid;
        });

        const updatedFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(updatedFiles);
        onFilesSelect(updatedFiles);
    };

    useEffect(() => {
        const newPreviewUrls = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newPreviewUrls);
        return () => {
            newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);

    const handleRemoveImage = (indexToRemove) => {
        URL.revokeObjectURL(previewUrls[indexToRemove]);
        const updatedFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
        setSelectedFiles(updatedFiles);
        onFilesSelect(updatedFiles);
    };

    return (
        <div className="input-block date-widget">
            <label className="form-label" style={{ fontSize: 16 }}>
                Tải lên hình ảnh (tùy chọn) 
            </label>
            {/* ({selectedFiles.length}/{MAX_FILES}) */}

            {selectedFiles.length < MAX_FILES && (
                <label className="upload-div" htmlFor="file-input-component" style={{ cursor: 'pointer' }}>
                    <input
                        id="file-input-component"
                        type="file"
                        accept=".jpeg,.jpg,.png"
                        multiple
                        onChange={handleFileChange}
                    // style={{ display: 'none' }}
                    />
                    <div className="upload-photo-drag">
                        <span>
                            <i className="fa fa-upload me-2"></i> Tải ảnh lên
                        </span>
                        <h6>hoặc Kéo thả để tải ảnh</h6>
                    </div>
                </label>
            )}

            {previewUrls.length > 0 && (
                <div className="upload-preview mt-3">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {previewUrls.map((url, index) => (
                            <div key={url} style={{ position: 'relative' }}>
                                <img
                                    src={url}
                                    alt={`Preview ${index}`}
                                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    style={{
                                        position: 'absolute', top: '-5px', right: '-5px', background: 'red',
                                        color: 'white', border: 'none', borderRadius: '50%',
                                        width: '20px', height: '20px', lineHeight: '18px',
                                        textAlign: 'center', cursor: 'pointer', padding: 0,
                                        fontSize: '14px', fontWeight: 'bold'
                                    }}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* <div className="upload-list mt-2">
                <ul style={{ fontSize: 11 }}>
                    Để đảm bảo ảnh của bạn được tải lên thành công, vui lòng lưu ý các điểm sau:
                    <li style={{ fontSize: 11, marginLeft: 15, marginTop: 5 }}>
                        Kích thước tối đa: Mỗi ảnh không quá 8 MB.
                    </li>
                    <li style={{ fontSize: 11, marginLeft: 15, marginTop: 5 }}>
                        Định dạng hỗ trợ: Vui lòng sử dụng các định dạng ảnh JPEG, JPG hoặc PNG.
                    </li>
                </ul>
            </div> */}
        </div>
    );
}

export default ImageUploader;
