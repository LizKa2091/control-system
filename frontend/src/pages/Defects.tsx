import { Table, Tag } from 'antd';

const Defects = () => {
  return (
    <Table
      rowKey="id"
      columns={[
        { title: 'Заголовок', dataIndex: 'title' },
        { title: 'Проект', dataIndex: 'project' },
        { title: 'Статус', dataIndex: 'status', render: (status: string) => <Tag>{status}</Tag> },
        { title: 'Приоритет', dataIndex: 'priority' },
      ]}
      dataSource={[]}
      pagination={{ pageSize: 10 }}
    />
  )
}

export default Defects;