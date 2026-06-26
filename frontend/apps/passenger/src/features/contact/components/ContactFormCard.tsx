import { useState } from "react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/Input";
import { landingCardClass, landingPrimaryButtonClass } from "@/features/home/lib/landing-layout";
import {
  CONTACT_CATEGORIES,
  CONTACT_FORM,
  type ContactCategory,
} from "@/features/contact/constants/contact-content";

const fieldClass =
  "flex min-h-[2.75rem] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const textareaClass =
  "min-h-[8rem] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function ContactFormCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<ContactCategory>("booking");
  const [message, setMessage] = useState("");

  return (
    <section className={cn(landingCardClass, "bg-[#121212] p-6")} aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="text-lg font-bold text-foreground">
        {CONTACT_FORM.title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">{CONTACT_FORM.description}</p>

      <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()} noValidate>
        <Input
          label={CONTACT_FORM.nameLabel}
          placeholder={CONTACT_FORM.namePlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />
        <Input
          label={CONTACT_FORM.emailLabel}
          type="email"
          placeholder={CONTACT_FORM.emailPlaceholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
        />
        <Input
          label={CONTACT_FORM.subjectLabel}
          placeholder={CONTACT_FORM.subjectPlaceholder}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />

        <div className="space-y-1.5">
          <label htmlFor="contact-category" className="text-sm font-medium text-foreground">
            {CONTACT_FORM.categoryLabel}
          </label>
          <select
            id="contact-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as ContactCategory)}
            className={fieldClass}
          >
            {CONTACT_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
            {CONTACT_FORM.messageLabel}
          </label>
          <textarea
            id="contact-message"
            className={textareaClass}
            placeholder={CONTACT_FORM.messagePlaceholder}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <button type="submit" disabled className={cn(landingPrimaryButtonClass, "w-full cursor-not-allowed opacity-50")}>
          {CONTACT_FORM.submitCta}
        </button>

        <p className="text-center text-xs text-muted-foreground">{CONTACT_FORM.soonNote}</p>
      </form>
    </section>
  );
}
