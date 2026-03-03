import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <Badge>Прозрачный тариф</Badge>
          <h1 className="text-3xl font-semibold">Цена сервиса «Домашний ангел»</h1>
          <p className="text-sm text-muted-foreground">
            Один тариф для семьи: устройства + аналитика + уведомления + кабинеты caregiver/senior.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-end justify-between gap-2">
              <span>Стандарт</span>
              <span className="text-3xl">1 990 ₽</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>Один дом, один комплект устройств, несколько родственников с доступом.</p>
            <p>Режимы Support 65 и Safety Plus переключаются без смены железа.</p>
            <p>История событий, инсайты, weekly summary, управление доступами.</p>
            <p>Оплата помесячно, статус и продление видны в кабинете caregiver.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
