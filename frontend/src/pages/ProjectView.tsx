import dayjs from 'dayjs';
import { type FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Space, Button, Tabs, Spin, Card, Descriptions } from 'antd';
import ProjectMembers from '../components/ProjectMembers';
import { useProjectById } from '../lib/projects';
import DefectsTable from '../components/DefectsTable';

const { Title, Text } = Typography;

const ProjectView: FC = () => {
   const { id } = useParams<{ id: string }>();
   const { data: project, isLoading } = useProjectById(id!);

   const [membersOpen, setMembersOpen] = useState(false);

   if (isLoading || !project) {
      return <Spin />;
   }

   return (
      <div style={{ padding: 24 }}>
         <Card style={{ marginBottom: 16 }}>
         <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
               <Title level={3} style={{ marginBottom: 0 }}>
               {project.name}
               </Title>
               <Text type="secondary">{project.status}</Text>
            </div>
            <Button onClick={() => setMembersOpen(true)}>Управление участниками</Button>
         </Space>
         </Card>

         <Tabs
            defaultActiveKey="overview"
            items={[
               {
                  key: 'overview',
                  label: 'Обзор',
                  children: (
                  <Descriptions bordered column={1}>
                     <Descriptions.Item label="Описание">
                        {project.description || '—'}
                     </Descriptions.Item>
                     <Descriptions.Item label="Дата создания">
                        {project.createdAt ? dayjs(project.createdAt).format('DD.MM.YYYY HH:mm') : '—'}
                     </Descriptions.Item>
                  </Descriptions>
                  ),
               },
               {
                  key: 'defects',
                  label: 'Дефекты',
                  children: <DefectsTable projectId={project.id} />,
               },
            ]}
         />
         <ProjectMembers
            projectId={project.id}
            open={membersOpen}
            onClose={() => setMembersOpen(false)}
         />
      </div>
   );
};

export default ProjectView;