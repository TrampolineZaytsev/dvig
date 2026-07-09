"use client";


import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function FriendsPanel() {
  const friends = [
    { name: "Маша", status: "идёт на «Вечер настолок»" },
    { name: "Илья", status: "сохранил «Лекцию в Эрарте»" },
    { name: "Катя", status: "свободна в выходные" },
  ];

  return (
    <div className="mt-5 space-y-4">
      <div className="dvig-panel p-5">
        <h2 className="text-xl font-semibold">Мои друзья</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Список друзей и их планы на встречи. В демо — мок; в продукте — социальный граф:
          кто идёт на то же событие, приглашения и совместные подборки.
        </p>
      </div>
      {friends.map((friend) => (
        <div key={friend.name} className="flex items-center gap-3 dvig-panel p-4">
          <Avatar>
            <AvatarFallback>{friend.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{friend.name}</p>
            <p className="text-sm text-muted-foreground">{friend.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
