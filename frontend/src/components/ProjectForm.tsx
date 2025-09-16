import { Form, Input, Modal, Select } from 'antd'
import { useEffect, type FC } from 'react'
import type { Project } from '../lib/projects.ts'

export type ProjectFormValues = {
  name: string
  status: Project['status']
};

interface IProjectFormProps {
  open: boolean
  initialValues?: Partial<ProjectFormValues>
  loading?: boolean
  title: string
  onSubmit: (values: ProjectFormValues) => void
  onCancel: () => void
};

const ProjectForm: FC<IProjectFormProps> = ({ open, initialValues, loading, onSubmit, onCancel, title }) => {
  const [form] = Form.useForm<ProjectFormValues>();

  useEffect(() => {
    form.resetFields();

    if (initialValues) {
      form.setFieldsValue(initialValues as ProjectFormValues);
    } 
    else {
      form.setFieldsValue({ status: 'planned' });
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
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Статус" rules={[{ required: true }]}> 
          <Select
            options={[
              { value: 'planned', label: 'Запланирован' },
              { value: 'in_progress', label: 'В работе' },
              { value: 'completed', label: 'Завершён' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProjectForm;