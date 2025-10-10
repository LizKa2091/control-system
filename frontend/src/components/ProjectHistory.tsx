import { Table } from 'antd';
import { useProjectHistory } from '../lib/projectHistory';

interface ProjectHistoryProps {
  projectId: string;
}

const ProjectHistory = ({ projectId }: ProjectHistoryProps) => {
  const { data, isLoading } = useProjectHistory(projectId);

  const columns = [
    { title: 'Поле', dataIndex: 'field' },
    { title: 'Старое значение', dataIndex: 'oldValue' },
    { title: 'Новое значение', dataIndex: 'newValue' },
    {
      title: 'Автор изменений',
      dataIndex: 'user',
      render: (user: { name: string; }) => user?.name ?? '—',
    },
    {
      title: 'Дата',
      dataIndex: 'changedAt',
      render: (date: string) =>
         new Date(date).toLocaleString('ru-RU', { hour12: false }),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={isLoading}
      pagination={false}
    />
  );
};

export default ProjectHistory;