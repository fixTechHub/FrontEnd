import React, { useState, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const IconUploader = ({ value, onChange, placeholder = "Upload icon image" }) => {
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (value) {
            setPreviewUrl(value);
        } else {
            setPreviewUrl('');
            setFileList([]);
        }
    }, [value]);

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ có thể upload file ảnh!');
            return false;
        }

        const isLt2M = file.size / 1024 / 1024 < 5;
        if (!isLt2M) {
            message.error('Kích thước ảnh phải nhỏ hơn 5MB!');
            return false;
        }

        return true;
    };

    const handleUpload = (info) => {
        const { file } = info;
        
        if (file.status === 'uploading') {
            return;
        }

        if (file.status === 'done') {
            // File is already processed by customRequest
            setFileList([file]);
        }
    };

    const handleRemove = () => {
        setFileList([]);
        setPreviewUrl('');
        onChange('');
    };

    const uploadProps = {
        name: 'icon',
        fileList: fileList,
        beforeUpload: beforeUpload,
        onChange: handleUpload,
        onRemove: handleRemove,
        maxCount: 1,
        accept: 'image/*',
        showUploadList: false,
        customRequest: ({ file, onSuccess }) => {
            // Handle file locally without uploading to server
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                setPreviewUrl(base64);
                onChange(base64);
                onSuccess();
            };
            reader.readAsDataURL(file);
        },
    };

    return (
        <div>
            <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                    {placeholder}
                </Button>
            </Upload>
            
            {previewUrl && (
                <div style={{ marginTop: 8 }}>
                    <img 
                        src={previewUrl} 
                        alt="Icon preview" 
                        style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #d9d9d9'
                        }} 
                    />
                    <Button 
                        type="text" 
                        danger 
                        size="small" 
                        onClick={handleRemove}
                        style={{ marginLeft: 8 }}
                    >
                        Gỡ
                    </Button>
                </div>
            )}
        </div>
    );
};

export default IconUploader; 