'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CouponMessage from './CouponMessage';

const COUPON_TAG_RE = /\[\[COUPON:(\d+)\]\]/g;

const mdComponents = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
  ),
};

function Markdown({ text }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function AssistantContent({ text, coupons }) {
  if (!coupons?.length || !text.includes('[[COUPON:')) return <Markdown text={text} />;

  const parts = [];
  let lastIndex = 0;
  let match;
  COUPON_TAG_RE.lastIndex = 0;
  while ((match = COUPON_TAG_RE.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) parts.push(<Markdown key={`t-${lastIndex}`} text={before} />);

    const coupon = coupons.find((c) => c.id === Number(match[1]));
    if (coupon) parts.push(<CouponMessage key={`c-${coupon.id}`} coupon={coupon} />);

    lastIndex = COUPON_TAG_RE.lastIndex;
  }
  const rest = text.slice(lastIndex).trim();
  if (rest) parts.push(<Markdown key={`t-${lastIndex}-end`} text={rest} />);

  return parts;
}

export default function ChatBubble({ sender, text, children, coupons }) {
  const isUser = sender === 'user';

  let content;
  if (isUser) {
    content = <p>{text ?? children}</p>;
  } else if (text) {
    content = <AssistantContent text={text} coupons={coupons} />;
  } else {
    content = children;
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm text-white leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #9f1239, #be123c)',
            borderBottomRightRadius: '4px',
          }}
        >
          {content}
        </div>
      ) : (
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed"
          style={{
            background: '#ffffff',
            border: '1px solid #fecdd3',
            color: '#1a1a1a',
            borderBottomLeftRadius: '4px',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
