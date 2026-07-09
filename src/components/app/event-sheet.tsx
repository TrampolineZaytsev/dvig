"use client";


import {
  Check,
  Download,
  InfoIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GroupSocialPanel } from "@/components/events/group-social-panel";
import type { ApiUser } from "@/lib/client/api-client";
import type { DvigEvent } from "@/lib/events";
import type { GroupSummary } from "@/lib/server/groups";
import { Info, SummaryItem } from "./display";
import { formatGroupLine, mockParticipantInitials } from "./utils";

export function EventSheet({
  event,
  user,
  isSaved,
  isJoined,
  groups,
  userOwnsGroup,
  onClose,
  onSave,
  onJoinGroup,
  onCreateGroup,
  onRequireAuth,
  onExportJson,
  onExportCsv,
}: {
  event: DvigEvent | null;
  user: ApiUser | null;
  isSaved: boolean;
  isJoined: boolean;
  groups: GroupSummary[];
  userOwnsGroup: boolean;
  onClose: () => void;
  onSave: (event: DvigEvent) => void;
  onJoinGroup: (groupId: string) => Promise<void>;
  onCreateGroup: (input: {
    meetingPoint?: string;
    telegramLink?: string;
    capacity?: number;
  }) => Promise<void>;
  onRequireAuth: () => void;
  onExportJson: (event: DvigEvent) => void;
  onExportCsv: (event: DvigEvent) => void;
}) {
  return (
    <Sheet open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader>
              <Badge className="mb-2 w-fit rounded-md bg-[#e6efe9] text-primary hover:bg-[#e6efe9]">
                {event.category}
              </Badge>
              <SheetTitle className="text-2xl">{event.title}</SheetTitle>
              <SheetDescription>{event.short}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Дата" value={`${event.date}, ${event.time}`} />
                <Info label="Цена" value={event.price} />
                <Info label="Группа" value={formatGroupLine(event)} />
                <Info label="Возраст" value={event.ageRestriction} />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <InfoIcon className="size-4 text-primary" />
                  Подробная карточка
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
              </div>
              <div className="dvig-panel p-4">
                <div className="mb-2 font-medium">Источник</div>
                <p className="text-sm text-muted-foreground">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {event.source}
                  </a>
                  {" · "}
                  данные от {event.updatedAt}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Проверьте время, цену и адрес на сайте организатора — агрегатор не
                  гарантирует актуальность.
                </p>
              </div>
              <div className="dvig-panel-muted p-4">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Кратко о событии
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  По описанию организатора / KudaGo, не нейросеть
                </p>
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <SummaryItem label="Почему стоит пойти" value={event.aiSummary.why} />
                  <SummaryItem label="Атмосфера" value={event.aiSummary.vibe} />
                  <SummaryItem label="Кому подойдет" value={event.aiSummary.audience} />
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <Table2 className="size-4 text-primary" />
                  Цены и даты
                </div>
                <div className="overflow-hidden rounded-md border border-border/50">
                  {event.priceOptions.map((option) => (
                    <div
                      key={`${option.date}-${option.time}`}
                      className="grid grid-cols-[1fr_0.8fr_0.8fr] gap-3 dvig-header p-3 text-sm last:border-b-0"
                    >
                      <span>{option.date}</span>
                      <span>{option.time}</span>
                      <span className="font-medium">{option.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dvig-panel-muted p-4">
                <div className="mb-3 flex items-center gap-2">
                  {mockParticipantInitials(event.id).map((initial) => (
                    <Avatar key={initial} className="size-9 border border-border/50">
                      <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Badge variant="outline" className="rounded-md text-xs">
                    участники · демо
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{event.moderator.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Модератор: {event.moderator}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      рейтинг {event.rating}
                    </p>
                  </div>
                </div>
              </div>
              <div className="dvig-panel p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Безопасность встречи
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    публичное место: {event.place}
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    группа от {event.groupCapacity} человек — не 1-на-1 на первом этапе
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    модератор видит заявки до подтверждения (в продукте)
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    можно выйти из встречи и скрыть профиль от участников
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-md">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {event.place}, {event.address}
              </div>
              <GroupSocialPanel
                event={event}
                user={user}
                groups={groups}
                userOwnsGroup={userOwnsGroup}
                onJoinGroup={onJoinGroup}
                onCreateGroup={onCreateGroup}
                onRequireAuth={onRequireAuth}
              />
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {isJoined && (
                <div className="w-full rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm">
                  {event.applicationStatus === "APPROVED" ? "Вы в группе" : "Заявка отправлена"}
                </div>
              )}
              <Button
                variant="outline"
                className="w-full rounded-md"
                onClick={() => onSave(event)}
              >
                {isSaved ? "Убрать из подборки" : "Сохранить в подборку"}
              </Button>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => onExportJson(event)}
                >
                  <Download className="size-4" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => onExportCsv(event)}
                >
                  <Download className="size-4" />
                  CSV
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
