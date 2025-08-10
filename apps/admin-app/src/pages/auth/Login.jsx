import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import ApiBE from '../../services/ApiBE';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Clear old errors
      setFormError('');
      form.setFields([
        { name: 'email', errors: [] },
        { name: 'password', errors: [] },
      ]);
      await ApiBE.post('auth/login', {
        email: values.email,
        password: values.password,
      }, { withCredentials: true });

      message.success('Logged in successfully');
      navigate('/admin/admin-dashboard');
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) {
        setFormError(msg || 'Invalid email or password');
      } else if (status === 403) {
        setFormError('Your account is blocked or inactive');
      } else {
        setFormError(msg || 'Login failed');
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
      <Card style={{ width: 420, borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Title level={3} style={{ marginBottom: 0 }}>Admin Login</Title>
          <Text type="secondary">Sign in to access admin dashboard</Text>
        </div>
        
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}> 
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
          </Form.Item>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
          </Form.Item>
          {formError && (
          <div style={{
            background: '#fff1f0',
            border: '1px solid #ffa39e',
            color: '#cf1322',
            padding: '8px 12px',
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13
          }}>
            {formError}
          </div>
        )}
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>Login</Button>
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <a href="/forgot-password">Forgot password?</a>
          </div>
        </Form>
        
      </Card>
    </div>
  );
};

export default Login;

