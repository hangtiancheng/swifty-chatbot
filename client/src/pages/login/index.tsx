import { useLogin } from "@/hooks/queries";
import SettingsBar from "@/components/settings-bar";
import { setTokenAtom } from "@/stores/auth";
import { useForm } from "@tanstack/react-form";
import { useSetAtom } from "jotai";
import { MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  username: z.string().min(1, "auth.username_required"),
  password: z.string().min(6, "auth.password_required"),
});

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "";
}

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useSetAtom(setTokenAtom);
  const loginMutation = useLogin();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(
        { username: value.username, password: value.password },
        {
          onSuccess: ({ code, token, message }) => {
            if (code === 1000 && token) {
              setToken(token);
              toast.success(t("auth.login_success"));
              navigate("/menu");
            } else {
              toast.error(message || t("auth.login_failed"));
            }
          },
          onError: (err) => {
            if (import.meta.env.DEV) console.error(err);
            toast.error(t("auth.login_failed"));
          },
        },
      );
    },
  });

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Settings Bar - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <SettingsBar />
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Card className="w-105 gap-0 shadow-none">
          <CardHeader className="pt-10 pb-2 text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                <MessageSquare className="text-primary size-8" />
              </div>
            </div>
            <h2 className="text-2xl font-normal">{t("auth.login")}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("auth.continue_with")}
            </p>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <FieldGroup className="gap-6">
                <form.Field name="username">
                  {(field) => {
                    const error = getErrorMessage(field.state.meta.errors[0]);
                    return (
                      <Field data-invalid={!field.state.meta.isValid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("auth.username")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder={t("auth.username_required")}
                          aria-invalid={!field.state.meta.isValid}
                          className="h-12"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {error && <FieldError>{t(error)}</FieldError>}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="password">
                  {(field) => {
                    const error = getErrorMessage(field.state.meta.errors[0]);
                    return (
                      <Field data-invalid={!field.state.meta.isValid}>
                        <FieldLabel htmlFor={field.name}>
                          {t("auth.password")}
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="password"
                          placeholder={t("auth.password_required")}
                          aria-invalid={!field.state.meta.isValid}
                          className="h-12"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {error && <FieldError>{t(error)}</FieldError>}
                      </Field>
                    );
                  }}
                </form.Field>

                <div className="flex items-center justify-between pt-4">
                  <Link
                    to="/register"
                    className="text-primary text-sm font-medium hover:opacity-80"
                  >
                    {t("auth.no_account")}
                  </Link>
                  <Button
                    type="submit"
                    className="press-feedback h-10 px-6"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending
                      ? t("auth.signing_in")
                      : t("common.next")}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
