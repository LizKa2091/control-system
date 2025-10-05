import { useState, type FC } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button, Card, Flex, Form, Input, Typography } from 'antd';
import { useAuth } from '../context/useAuth';
import type { AxiosError } from 'axios';
import { useApi } from '../lib/useApi';

interface IFormMessage {
   type: 'error' | 'success';
   text: string;
}

interface IFormData {
   email: string;
   password: string;
}

const Login: FC = () => {
   const [form] = Form.useForm<IFormData>();
   const [formMessage, setFormMessage] = useState<IFormMessage | null>(null)
   const navigate = useNavigate();
   const location = useLocation();
   const { login } = useAuth();
   const api = useApi();

   const onFinish = async (values: IFormData) => {
      setFormMessage(null);

      try {
         const { data } = await api.post('/auth/login', values);

         const token: string = data?.accessToken;
         const user = data?.user;

         if (!token) throw new Error('Токен отсутствует');

         login(token, user);
         setFormMessage({ type: 'success', text: 'Вход выполнен успешно' });

         const fromPath = location.state?.from?.pathname || '/dashboard';
         navigate(fromPath, { replace: true });
      } catch (e: unknown) {
         const err = e as AxiosError<{ message?: string }>;

         setFormMessage({ type: 'error', text: err?.response?.data?.message || 'Не удалось войти' });
      }
   };

   return (
      <Flex
         style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
         }}
      >
         <Card style={{ width: 360 }}>
            <Typography.Title level={3} style={{ textAlign: 'center' }}>
               Вход
            </Typography.Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
               <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, message: 'Введите email' }]}
               >
                  <Input type="email" />
               </Form.Item>
               <Form.Item
                  name="password"
                  label="Пароль"
                  rules={[{ required: true, message: 'Введите пароль' }]}
               >
                  <Input.Password />
               </Form.Item>
               <Form.Item>
                  <Button type="primary" htmlType="submit" block>
                     Войти
                  </Button>
               </Form.Item>
               {formMessage && (
                  <Typography.Text type={formMessage.type === 'error' ? 'danger' : 'success'}>
                  {formMessage.text}
                  </Typography.Text>
               )}
               <Typography.Paragraph style={{ marginBottom: 0 }}>
                  Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
               </Typography.Paragraph>
               <Typography.Paragraph style={{ marginBottom: 0 }}>
                  Забыли пароль? <Link to="/forgot">Восстановить</Link>
               </Typography.Paragraph>
            </Form>
         </Card>
      </Flex>
   );
};

export default Login;
