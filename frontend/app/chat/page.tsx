import PageHeader from '../../components/ui/PageHeader';
import ChatFrame from '../../components/chat/ChatFrame';

export default function ChatIndexPage() {
  return (
    <div>
      <PageHeader eyebrow="Inbox" title="Conversations" />
      <ChatFrame />
    </div>
  );
}
