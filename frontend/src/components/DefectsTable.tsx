import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { useApi } from '../lib/useApi';

const { Option } = Select;

interface Defect {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  createdBy?: { name?: string };
  assignee?: { name?: string };
  createdAt: string;
  projectId?: string;
}

interface Props {
  projectId?: string;
}

const DefectsTable: React.FC<Props> = ({ projectId }) => {
  const api = useApi();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchDefects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/defects');
      const filtered = projectId ? data.filter((d: Defect) => d.projectId === projectId) : data;
      setDefects(filtered);
    } catch {
      message.error('Не удалось загрузить дефекты');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDefects();
  }, [projectId]);

  const handleCreate = async (values: Omit<Defect, 'id' | 'createdAt'>) => {
    try {
      await api.post('/defects', { ...values, projectId });
      message.success('Дефект успешно создан');
      setIsModalOpen(false);
      form.resetFields();
      void fetchDefects();
    } catch {
      message.error('Ошибка при создании дефекта');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/defects/${id}`);
      message.success('Дефект удалён');
      setDefects((prev) => prev.filter((d) => d.id !== id));
    } catch {
      message.error('Ошибка при удалении дефекта');
    }
  };

  const columns: ColumnsType<Defect> = [
    { title: 'Заголовок', dataIndex: 'title', key: 'title' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    { title: 'Приоритет', dataIndex: 'priority', key: 'priority' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    {
      title: 'Автор',
      dataIndex: ['createdBy', 'name'],
      key: 'createdBy',
      render: (v?: string) => v || '—',
    },
    {
      title: 'Исполнитель',
      dataIndex: ['assignee', 'name'],
      key: 'assignee',
      render: (v?: string) => v || '—',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: unknown, record: Defect) => (
        <Popconfirm
          title="Удалить дефект?"
          onConfirm={() => handleDelete(record.id)}
          okText="Да"
          cancelText="Нет"
        >
          <Button danger size="small">
            Удалить
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Новый дефект
        </Button>
        <Button onClick={fetchDefects}>Обновить</Button>
      </Space>

      <Table<Defect>
        rowKey="id"
        columns={columns}
        dataSource={defects}
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title="Создать дефект"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Создать"
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Приоритет"
            rules={[{ required: true, message: 'Выберите приоритет' }]}
          >
            <Select placeholder="Выберите приоритет">
              <Option value="low">Низкий</Option>
              <Option value="medium">Средний</Option>
              <Option value="high">Высокий</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DefectsTable;