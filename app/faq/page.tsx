import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "Нужны ли камеры в квартире?",
    answer:
      "Нет. В MVP используются датчики движения/двери/газа/воды и носимое устройство с SOS, без видеонаблюдения."
  },
  {
    question: "Как входить в систему?",
    answer:
      "Через magic link по email. Выберите роль на /login, введите email, откройте письмо и перейдите по ссылке."
  },
  {
    question: "Можно ли подключить несколько родственников к одному подопечному?",
    answer:
      "Да. В разделе Access можно пригласить другого caregiver по email и выдать ему viewer-доступ."
  },
  {
    question: "Чем Support 65 отличается от Safety Plus?",
    answer:
      "Support 65 акцентируется на мягких рекомендациях, Safety Plus чаще поднимает события до критичных."
  }
];

export default function FaqPage() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">FAQ</h1>
        <p className="text-sm text-muted-foreground">Частые вопросы по сервису «Домашний ангел».</p>
      </div>

      <div className="mt-6 space-y-3">
        {faqs.map((item) => (
          <Card key={item.question}>
            <CardHeader>
              <CardTitle className="text-base">{item.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.answer}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
