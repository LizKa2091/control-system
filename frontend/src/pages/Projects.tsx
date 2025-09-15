import { Table } from 'antd';

const Projects = () => {
  return (
    <Table
      rowKey="id"
      columns={[
        { title: 'Проект', dataIndex: 'name' },
        { title: 'Статус', dataIndex: 'status' },
      ]}
      dataSource={[]}
      pagination={false}
    />
  )
}

export default Projects;