import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function chooseRoleAction(role: "caregiver" | "senior") {
  "use server";

  cookies().set("role_hint", role, {
    path: "/",
    maxAge: 60 * 30,
    sameSite: "lax"
  });

  redirect(role === "caregiver" ? "/auth/caregiver" : "/auth/senior");
}

export default function LoginPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Войти как родственник</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Управляйте подопечными, устройствами, событиями, доступами семьи и подпиской в одном
              кабинете caregiver.
            </p>
            <form action={chooseRoleAction.bind(null, "caregiver")}>
              <Button type="submit" className="w-full">
                Войти как родственник
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Войти как пользователь 65+</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Простой интерфейс с крупным текстом: активность, подсказки, список родственников и
              быстрый доступ к настройкам.
            </p>
            <form action={chooseRoleAction.bind(null, "senior")}>
              <Button type="submit" variant="outline" className="w-full">
                Войти как пользователь 65+
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
