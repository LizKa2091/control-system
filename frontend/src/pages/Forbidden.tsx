import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';

const Forbidden: FC = () => {
   return (
      <Result
         status="403"
         title="403"
         subTitle="У вас нет доступа к этой странице"
         extra={
            <Button type="primary">
               <Link to="/dashboard">На главную</Link>
            </Button>
         }
      />
   );
};

export default Forbidden;
