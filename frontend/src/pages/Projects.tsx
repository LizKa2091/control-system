import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popconfirm, Space, Table } from 'antd';
import {
   useCreateProject,
   useDeleteProject,
   useProjects,
   useUpdateProject,
   type Project
} from '../lib/projects';
import ProjectForm, { type ProjectFormValues } from '../components/ProjectForm';
import ProjectMembers from '../components/ProjectMembers';

const Projects = () => {
   const { data } = useProjects();
   const createMutation = useCreateProject();
   const updateMutation = useUpdateProject();
   const deleteMutation = useDeleteProject();

   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editing, setEditing] = useState<Project | null>(null);

   const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
   const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

   const columns = useMemo(
      () => [
         { 
            title: 'Проект', 
            dataIndex: 'name', 
            render: (_: unknown, record: Project) => (
               <Link to={`/projects/${record.id}`}>{record.name}</Link>
            )},
         { title: 'Статус', dataIndex: 'status' },
         {
            title: 'Действия',
            key: 'actions',
            render: (_: unknown, record: Project) => (
               <Space>
                  <Button
                     size="small"
                     onClick={() => {
                        setEditing(record);
                        setIsModalOpen(true);
                     }}
                  >
                     Изменить
                  </Button>
                  <Button
                     size="small"
                     onClick={() => {
                        setSelectedProjectId(record.id);
                        setIsMembersModalOpen(true);
                     }}
                  >
                     Участники
                  </Button>
                  <Popconfirm
                     title="Удалить проект?"
                     okText="Да"
                     cancelText="Нет"
                     onConfirm={() => deleteMutation.mutate(record.id)}
                  >
                     <Button size="small" danger>
                        Удалить
                     </Button>
                  </Popconfirm>
               </Space>
            ),
         },
      ],
      [deleteMutation]
   );

   return (
      <>
         <Space style={{ marginBottom: 16 }}>
            <Button
               type="primary"
               onClick={() => {
                  setEditing(null);
                  setIsModalOpen(true);
               }}
            >
               Создать проект
            </Button>
         </Space>

         <Table
            rowKey="id"
            columns={columns}
            dataSource={data ?? []}
            pagination={false}
         />

         <ProjectForm
            open={isModalOpen}
            title={editing ? 'Изменить проект' : 'Создать проект'}
            initialValues={
               editing
                  ? { name: editing.name, status: editing.status }
                  : undefined
            }
            loading={createMutation.isPending || updateMutation.isPending}
            onCancel={() => {
               setIsModalOpen(false);
               setEditing(null);
            }}
            onSubmit={(values: ProjectFormValues) => {
               if (editing) {
                  updateMutation.mutate(
                     { id: editing.id, ...values },
                     {
                        onSuccess: () => {
                           setIsModalOpen(false);
                           setEditing(null);
                        },
                     }
                  );
               } else {
                  createMutation.mutate(values, {
                     onSuccess: () => {
                        setIsModalOpen(false);
                     },
                  });
               }
            }}
         />

         {selectedProjectId && (
            <ProjectMembers
               projectId={selectedProjectId}
               open={isMembersModalOpen}
               onClose={() => setIsMembersModalOpen(false)}
            />
         )}
      </>
   );
};

export default Projects;