import { useEffect, type FC } from 'react';
import { Form, Input, Modal, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { DefectPriority } from '../lib/defects';

export type DefectFormValues = {
  title: string
  description?: string
  projectName?: string
  priority: DefectPriority
  attachments?: { id: string; name: string }[]
}

interface IDefectFormProps {
  open: boolean;
  initialValues?: Partial<DefectFormValues>;
  loading?: boolean;
  title: string;
  onSubmit: (values: DefectFormValues) => void;
  onCancel: () => void;
};

const DefectForm: FC<IDefectFormProps> = ({ open, initialValues, loading, onSubmit, onCancel, title }) => {
  const [form] = Form.useForm<DefectFormValues>()

  useEffect(() => {
    form.resetFields();

    if (initialValues) {
      form.setFieldsValue(initialValues as DefectFormValues);
    } 
    else {
      form.setFieldsValue({ priority: 'medium' });
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title={title}
      okText="Сохранить"
      cancelText="Отмена"
      confirmLoading={loading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={(vals) => {
        const files = (vals as any).files?.fileList as { name: string }[] | undefined
        const attachments = files?.map((f) => ({ id: crypto.randomUUID(), name: f.name }))
        onSubmit({ ...vals, attachments })
      }}>
        <Form.Item name="title" label="Название" rules={[{ required: true, message: 'Введите название' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Описание"> 
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="projectName" label="Проект"> 
          <Input />
        </Form.Item>
        <Form.Item name="priority" label="Приоритет" rules={[{ required: true }]}> 
          <Select
            options={[
              { value: 'low', label: 'Низкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'high', label: 'Высокий' },
            ]}
          />
        </Form.Item>
        <Form.Item name="files" label="Вложения">
          <Upload beforeUpload={() => false} multiple>
            <button className="ant-btn">
              <UploadOutlined /> Добавить файлы
            </button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DefectForm;