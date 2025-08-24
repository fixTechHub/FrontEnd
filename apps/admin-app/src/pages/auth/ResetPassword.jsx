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
      message.success('Password has been reset. Please login again.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Reset password failed';
      // Hiển thị lỗi chi tiết thường gặp
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        message.error('Reset code is invalid or expired. Please request a new email.');
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
          <Title level={3} style={{ marginBottom: 0 }}>Reset Password</Title>
          <Text type="secondary">Enter the code and your new password</Text>
        </div>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" initialValues={initialValues}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Invalid email' }]}> 
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" disabled={!!emailFromQuery} />
          </Form.Item>
          {/* <Form.Item label="Code" name="code" rules={[{ required: true, message: 'Please enter the code' }]}> 
            <Input prefix={<SafetyOutlined />} placeholder="Reset code" size="large" disabled={!!code} value={code} />
          </Form.Item> */}
          <Form.Item label="New Password" name="newPassword" rules={[{ required: true, message: 'Please enter your new password' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="New password" size="large" />
          </Form.Item>
          <Form.Item label="Confirm New Password" name="confirmPassword" dependencies={["newPassword"]} rules={[
            { required: true, message: 'Please confirm your new password' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('The two passwords do not match'));
              },
            }),
          ]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>Reset</Button>
          </Form.Item>
          
        </Form>
      </Card>
    </div>
  );
};

export default ResetPassword;

