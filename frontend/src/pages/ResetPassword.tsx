import type { FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Flex, Form, Input, Typography, message } from 'antd';
import { api } from '../lib/api';
import type { AxiosError } from 'axios';

interface IFormData {
   password: string;
}

const ResetPassword: FC = () => {
   const [form] = Form.useForm<IFormData>();
   const [params] = useSearchParams();
   const navigate = useNavigate();

   const token = params.get('token') || '';

   const onFinish = async (values: IFormData) => {
      try {
         await api.post('/auth/reset', { token, password: values.password });

         message.success('Пароль обновлён');
         navigate('/login', { replace: true });
      } catch (e: unknown) {
         const err = e as AxiosError<{ message?: string }>;

         message.error(
            err?.response?.data?.message || 'Не удалось обновить пароль'
         );
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
         <Card style={{ width: 420 }}>
            <Typography.Title level={3} style={{ textAlign: 'center' }}>
               Сброс пароля
            </Typography.Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
               <Form.Item
                  name="password"
                  label="Новый пароль"
                  rules={[{ required: true, message: 'Введите пароль' }]}
               >
                  <Input.Password />
               </Form.Item>
               <Form.Item>
                  <Button
                     type="primary"
                     htmlType="submit"
                     block
                     disabled={!token}
                  >
                     Обновить пароль
                  </Button>
               </Form.Item>
            </Form>
         </Card>
      </Flex>
   );
};

export default ResetPassword;
