import { useMemo, useState } from 'react';
import { Button, Space, Table, Tag, Popconfirm } from 'antd';
import { useAdvanceStatus, useCreateDefect, useDefects, useDeleteDefect, useUpdateDefect, type Defect } from '../lib/defects'
import DefectForm, { type DefectFormValues } from '../components/DefectForm';

const statusToColor: Record<string, string> = {
  new: 'default',
  in_progress: 'processing',
  review: 'warning',
  closed: 'success',
}

const Defects = () => {
  const { data } = useDefects();
  const createMutation = useCreateDefect();
  const updateMutation = useUpdateDefect();
  const deleteMutation = useDeleteDefect();
  const advanceMutation = useAdvanceStatus();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editing, setEditing] = useState<Defect | null>(null)

  const columns = useMemo(
    () => [
      { title: 'Заголовок', dataIndex: 'title' },
      { title: 'Проект', dataIndex: 'projectName' },
      {
        title: 'Статус',
        dataIndex: 'status',
        render: (status: string) => <Tag color={statusToColor[status] || 'default'}>{status}</Tag>,
      },
      { title: 'Приоритет', dataIndex: 'priority' },
      {
        title: 'Действия',
        key: 'actions',
        render: (_: unknown, record: Defect) => (
          <Space>
            <Button size="small" onClick={() => { setEditing(record); setIsModalOpen(true) }}>Изменить</Button>
            <Button size="small" type="dashed" onClick={() => advanceMutation.mutate(record.id)} loading={advanceMutation.isPending}>Передать дальше</Button>
            <Popconfirm title="Удалить дефект?" okText="Да" cancelText="Нет" onConfirm={() => deleteMutation.mutate(record.id)}>
              <Button size="small" danger loading={deleteMutation.isPending}>Удалить</Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [advanceMutation.isPending, deleteMutation.isPending]
  )

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => { setEditing(null); setIsModalOpen(true) }}>
          Создать дефект
        </Button>
      </Space>
      <Table rowKey="id" columns={columns as any} dataSource={data ?? []} pagination={{ pageSize: 10 }} />
      <DefectForm
        open={isModalOpen}
        title={editing ? 'Изменить дефект' : 'Создать дефект'}
        initialValues={editing ? {
          title: editing.title,
          description: editing.description,
          projectName: editing.projectName,
          priority: editing.priority,
        } : undefined}
        loading={createMutation.isPending || updateMutation.isPending}
        onCancel={() => { setIsModalOpen(false); setEditing(null) }}
        onSubmit={(values: DefectFormValues) => {
          if (editing) {
            updateMutation.mutate({
              id: editing.id,
              title: values.title,
              description: values.description,
              projectName: values.projectName,
              priority: values.priority,
              attachments: values.attachments ?? editing.attachments,
            }, 
            { onSuccess: () => { setIsModalOpen(false); setEditing(null) } })
          } 
          else {
            createMutation.mutate({
              title: values.title,
              description: values.description,
              projectName: values.projectName,
              priority: values.priority,
              attachments: values.attachments,
            }, 
            { onSuccess: () => { setIsModalOpen(false); setEditing(null) } })
          }
        }}
      />
    </>
  )
}

export default Defects;