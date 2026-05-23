interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="border-b border-gray-200 pb-6">
            <h3 className="font-semibold text-gray-800 mb-2">{item.question}</h3>
            <p className="text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
