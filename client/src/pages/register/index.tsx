import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { setTokenAtom } from "@/stores/auth";
import { useRegister } from "@/hooks/queries";
import { toast } from "sonner";
import SettingsBar from "@/components/settings-bar";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    email: z.string().email("auth.email_invalid"),
    password: z.string().min(6, "auth.password_required"),
    confirmPassword: z.string().min(1, "auth.confirm_password_required"),
  })
  // refine 自定义校验逻辑
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.password_mismatch",
    // path 绑定到 confirmPassword 字段
    path: ["confirmPassword"],
  });

function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "";
}

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setToken = useSetAtom(setTokenAtom);
  const registerMutation = useRegister();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: ({ value }) => {
      registerMutation.mutate(
        { email: value.email, password: value.password },
        {
          onSuccess: ({ code, token, message }) => {
            if (code === 1000 && token) {
              setToken(token);
              toast.success(t("auth.register_success"));
              navigate("/menu");
            } else {
              toast.error(message || t("auth.register_failed"));
            }
          },
          onError: (err) => {
            if (import.meta.env.DEV) console.error(err);
            toast.error(t("auth.register_failed"));
          },
        },
      );
    },
  });

  const fields = [
    { name: "email", type: "email", placeholder: "auth.email_required" },
    {
      name: "password",
      type: "password",
      placeholder: "auth.password_required",
    },
    {
      name: "confirmPassword",
      type: "password",
      placeholder: "auth.password_mismatch",
    },
  ] as const;

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="absolute top-4 right-4 z-10">
        <SettingsBar />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-105 gap-0 shadow-none">
          <CardHeader className="pt-10 pb-2 text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
                <UserPlus className="text-primary size-8" />
              </div>
            </div>
            <h2 className="text-2xl font-normal">{t("auth.register")}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {t("auth.register_for")}
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
              <FieldGroup className="gap-5">
                {fields.map(({ name, type, placeholder }) => (
                  <form.Field key={name} name={name}>
                    {(field) => {
                      const error = getErrorMessage(field.state.meta.errors[0]);
                      return (
                        <Field data-invalid={!field.state.meta.isValid}>
                          <FieldLabel htmlFor={field.name}>
                            {t(
                              `auth.${name === "confirmPassword" ? "confirm_password" : name}`,
                            )}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            type={type}
                            placeholder={t(placeholder)}
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
                ))}

                <div className="flex items-center justify-between pt-4">
                  <Link
                    to="/login"
                    className="text-primary text-sm font-medium hover:opacity-80"
                  >
                    {t("auth.has_account")}
                  </Link>
                  <Button
                    type="submit"
                    className="press-feedback h-10 px-6"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending
                      ? t("auth.signing_up")
                      : t("auth.register")}
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

export default Register;
