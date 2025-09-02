import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ApiBE from '../../services/ApiBE';

const { Title, Text } = Typography;

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Clear previous field errors
      form.setFields([
        { name: 'currentPassword', errors: [] },
        { name: 'newPassword', errors: [] },
        { name: 'confirmPassword', errors: [] },
      ]);
      await ApiBE.post('auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }, { withCredentials: true });
      message.success('Thay đổi mật khẩu thành công');
      navigate('/admin/admin-dashboard', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || 'Thay đổi mật khẩu thất bại';
      if (status === 401 || /incorrect/i.test(msg)) {
        form.setFields([
          { name: 'currentPassword', errors: [msg || 'Mật khẩu hiện tại không hợp lệ'] },
        ]);
      } else {
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%)',
      padding: 16,
    }}>
      <Card style={{ width: 480, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <Space align="center" style={{ justifyContent: 'space-between', width: '100%', marginBottom: 8 }}>
          <Button type="link" onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Quay lại</Button>
        </Space>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Thay đổi mật khẩu</Title>
          <Text type="secondary">Cập nhật mật khẩu tài khoản của bạn</Text>
        </div>
        <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={() => { /* show field errors */ }} autoComplete="off" validateTrigger={["onChange","onBlur"]}>
          <Form.Item label="Mật khẩu hiện tại" name="currentPassword" hasFeedback rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" size="large" />
          </Form.Item>
          <Form.Item label="Mật khẩu mới" name="newPassword" hasFeedback rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" hasFeedback dependencies={["newPassword"]} rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Hai mật khẩu không khớp'));
              },
            }),
          ]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={() => form.submit()} size="large" block loading={loading}>Lưu thay đổi</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePassword;

