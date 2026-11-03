import { useParams } from 'react-router-dom';
import TicketDetails from '../components/TicketDetails';

export default function TicketDetailPage() {
  const { id } = useParams();

  return <TicketDetails ticketId={id} />;
}
