import React, { useState, useMemo } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, MailOutlined, SafetyOutlined } from '@ant-design/icons';
import ApiBE from '../../services/ApiBE';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') || '';
  const emailFromQuery = searchParams.get('email') || '';

  const initialValues = useMemo(() => ({ email: emailFromQuery, code }), [emailFromQuery, code]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const emailToSend = (emailFromQuery || values.email || '').trim().toLowerCase();
      const codeToSend = (code || values.code || '').trim();
      await ApiBE.post('auth/reset-password', {
        email: emailToSend,
        code: codeToSend,
        newPassword: values.newPassword,
      });
      message.success('Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Đặt lại mật khẩu thất bại';
      // Hiển thị lỗi chi tiết thường gặp
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        message.error('Mã đặt lại không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu email mới.');
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
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Đặt lại mật khẩu</Title>
          <Text type="secondary">Nhập mật khẩu mới</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" initialValues={initialValues}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}> 
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" disabled={!!emailFromQuery} />
          </Form.Item>
          {/* <Form.Item label="Code" name="code" rules={[{ required: true, message: 'Please enter the code' }]}> 
            <Input prefix={<SafetyOutlined />} placeholder="Reset code" size="large" disabled={!!code} value={code} />
          </Form.Item> */}
          <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
          </Form.Item>
          <Form.Item label="Xác nhận mật khẩu mới" name="confirmPassword" dependencies={["newPassword"]} rules={[
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
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>Đặt lại</Button>
          </Form.Item>
          
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;

