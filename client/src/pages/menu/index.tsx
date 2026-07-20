import SettingsBar from "@/components/settings-bar";
import { setTokenAtom } from "@/stores/auth";
import { useSetAtom } from "jotai";
import { LogOut, MessageSquare, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Menu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useSetAtom(setTokenAtom);

  const handleLogout = () => {
    setToken(null);
    toast.success(t("auth.logout_success"));
    navigate("/login");
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-full">
              <Sparkles className="text-primary size-5" />
            </div>
            <h1 className="text-xl font-normal">{t("menu.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsBar />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut data-icon="inline-start" />
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Welcome Section */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-normal">{t("menu.welcome")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("menu.select_app")}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* AI Chat Card */}
            <Card
              className="group hover:border-primary cursor-pointer transition-all duration-200 hover:shadow-lg"
              onClick={() => navigate("/ai-chat")}
            >
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className="bg-primary/10 group-hover:bg-primary flex size-14 shrink-0 items-center justify-center rounded-2xl transition-colors">
                    <MessageSquare className="text-primary group-hover:text-primary-foreground size-7 transition-colors" />
                  </div>
                  <div>
                    <h3 className="group-hover:text-primary mb-2 text-lg font-medium transition-colors">
                      {t("menu.ai_chat")}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("menu.ai_chat_desc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon Card */}
            <Card className="opacity-60">
              <CardContent className="p-8">
                <div className="flex items-start gap-5">
                  <div className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-2xl">
                    <span className="text-muted-foreground text-2xl">+</span>
                  </div>
                  <div>
                    <h3 className="text-muted-foreground mb-2 text-lg font-medium">
                      {t("menu.more_features")}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t("menu.coming_soon")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-4">
        <div className="text-muted-foreground mx-auto flex max-w-7xl items-center justify-between px-6 text-sm">
          <span>
            © {new Date().getFullYear()} {t("menu.title")}
          </span>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer">
              {t("menu.privacy_policy")}
            </span>
            <span className="hover:text-foreground cursor-pointer">
              {t("menu.terms_of_service")}
            </span>
            <span className="hover:text-foreground cursor-pointer">
              {t("menu.help")}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Menu;
