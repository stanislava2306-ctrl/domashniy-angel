import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CaregiverSupportPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Поддержка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>В MVP доступна упрощённая поддержка по email и демонстрационные рекомендации.</p>
          <p>
            Для демонстрации используйте `/api/dev/seed` и devtools на карточке подопечного, чтобы
            быстро наполнить ленту событий.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-2">
                Контакты поддержки
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Связаться с поддержкой</DialogTitle>
              <DialogDescription>
                Email: support@domashniy-angel.demo
                <br />
                Время: пн-пт 10:00-19:00 (MSK)
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
