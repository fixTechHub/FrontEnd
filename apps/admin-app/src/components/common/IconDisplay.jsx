import React from 'react';

const IconDisplay = ({ icon, size = 40, className = '' }) => {
    // Check if icon is a base64 image
    const isBase64Image = icon && (icon.startsWith('data:image/') || icon.startsWith('data:application/'));
    
    if (isBase64Image) {
        return (
            <img 
                src={icon} 
                alt="Icon" 
                style={{ 
                    width: size, 
                    height: size, 
                    objectFit: 'cover',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9'
                }}
                className={className}
            />
        );
    }
    
    // If it's an icon class (like "ti ti-tools")
    if (icon && icon.includes(' ')) {
        return (
            <i 
                className={icon} 
                style={{ 
                    fontSize: size * 0.6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: size,
                    height: size,
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9'
                }}
            />
        );
    }
    
    // Fallback for text or empty
    return (
        <div 
            style={{ 
                width: size, 
                height: size, 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#999'
            }}
            className={className}
        >
            {icon || 'N/A'}
        </div>
    );
};

export default IconDisplay; 