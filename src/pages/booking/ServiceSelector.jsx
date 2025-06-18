import React, { useMemo, useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';

function ServiceSelector({ categories, services, onServiceChange, selectedServiceName }) {
    const [mainActiveKey, setMainActiveKey] = useState(null);

    const servicesByCategory = useMemo(() => {
        if (!categories?.length || !services?.length) return {};

        const grouped = {}; 
        // console.log('--- INITIALIZE GROUPED ---', grouped);

        categories.forEach(category => {
            grouped[String(category._id)] = [];
        }); 
        // console.log('--- CATEGORIES GROUPED ---', grouped);

        services.forEach(service => {
            const categoryId = String(service.categoryId);
            if (grouped[categoryId]) {
                grouped[categoryId].push(service);
            }
        }); 
        // console.log('--- SERVICES GROUPED ---', grouped);

        return grouped;
    }, [services, categories]);

    const handleServiceClick = (service) => {
        onServiceChange(service);

        setMainActiveKey(null);
    };

    return (
        <div className="group-img">
            <Accordion activeKey={mainActiveKey} onSelect={(key) => setMainActiveKey(key)}>
                <Accordion.Item eventKey="0">

                    <Accordion.Header>
                        {selectedServiceName || 'Chọn một dịch vụ'}
                    </Accordion.Header>

                    <Accordion.Body>
                        <Accordion>
                            {categories.map((category) => {
                                const currentServices = servicesByCategory[String(category._id)] || [];

                                return (
                                    <Accordion.Item eventKey={category._id} key={category._id}>
                                        <Accordion.Header>{category.categoryName}</Accordion.Header>
                                        <Accordion.Body>
                                            {currentServices.length > 0 ? (
                                                currentServices.map((service) => (
                                                    <div
                                                        key={service._id}
                                                        className="booking-service form-control"
                                                        onClick={() => handleServiceClick(service)}
                                                        style={{marginBottom: 5}}
                                                    >
                                                        {service.serviceName}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="form-controls">Không có dịch vụ nào trong danh mục này.</p>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                );
                            })}
                        </Accordion>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}

export default ServiceSelector;