import { motion } from "framer-motion";
import { useState } from "react";
import { profile } from "@/data/profile";
import { validateContactFields, type ContactFields } from "@/lib/contactValidation";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6_hmNogiRhIAkAdfWU9q0wQb2WdEvswPCTHCd9U-giehtMTgKcmZq2NsQES-XYuxd/exec";

type FormStatus = "idle" | "sending" | "success" | "error";

const initialForm: ContactFields = {
  firstName: "",
  lastName: "",
  email: "",
  subject: "",
  message: "",
};

const Contact = () => {
  const [formData, setFormData] = useState<ContactFields>(initialForm);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValidationError(null);
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const error = validateContactFields(formData);
    if (error) {
      setValidationError(error);
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const body = new URLSearchParams(formData);
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setStatus("success");
      setFormData(initialForm);
    } catch {
      setStatus("error");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <section aria-labelledby="contact-title" className="h-screen w-full bg-white text-black font-sans px-4 md:px-8 lg:px-12 overflow-hidden flex items-center justify-center relative">
      <motion.div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 lg:gap-x-16 max-w-[1400px] w-full mx-auto" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="lg:col-span-7 flex flex-col justify-between h-full py-2">
          <motion.div variants={itemVariants} className="mb-8 lg:mb-0">
            <h1 id="contact-title" className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tight text-left">Contact <br />Me <span className="inline-block ml-2" aria-hidden="true">→</span></h1>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-8 lg:mt-0 hidden lg:block">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-black/60">Contact Form</h2>
            <p className="text-base md:text-lg font-normal leading-relaxed text-black/80 max-w-md text-left">Send me a message and I'll get back to you as soon as possible. Let's build something intelligent together.</p>
            <a className="mt-4 inline-block text-sm font-bold uppercase tracking-wider underline underline-offset-4" href={`mailto:${profile.email}`}>{profile.email}</a>
          </motion.div>
        </div>

        <motion.div className="lg:col-span-5 flex flex-col justify-center" variants={itemVariants}>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider">First Name*</label><input autoComplete="given-name" type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-transparent border-b border-black/30 py-1 text-lg font-medium focus:border-black focus:outline-none transition-colors" required /></div>
              <div className="flex flex-col gap-1"><label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider">Last Name*</label><input autoComplete="family-name" type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-transparent border-b border-black/30 py-1 text-lg font-medium focus:border-black focus:outline-none transition-colors" required /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1"><label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email*</label><input autoComplete="email" type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-transparent border-b border-black/30 py-1 text-lg font-medium focus:border-black focus:outline-none transition-colors" required /></div>
              <div className="flex flex-col gap-1"><label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider">Subject*</label><input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-transparent border-b border-black/30 py-1 text-lg font-medium focus:border-black focus:outline-none transition-colors" required /></div>
            </div>
            <div className="flex flex-col gap-1"><label htmlFor="message" className="text-xs font-bold uppercase tracking-wider">Message*</label><textarea id="message" name="message" rows={3} value={formData.message} onChange={handleChange} className="w-full bg-transparent border-b border-black/30 py-1 text-lg font-medium focus:border-black focus:outline-none transition-colors resize-none" required /></div>

            <div className="mt-4 flex flex-col gap-2" aria-live="polite">
              <button type="submit" disabled={status === "sending"} className="group flex items-center gap-3 text-lg font-bold uppercase tracking-wider hover:text-black/70 transition-colors disabled:opacity-50">{status === "sending" ? "Sending…" : "Send Message"}<span className="group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true">→</span></button>
              {validationError && <p className="text-sm text-red-500 font-medium">{validationError}</p>}
              {!validationError && status === "success" && <p className="text-sm text-green-600 font-medium">Message sent. I'll get back to you soon.</p>}
              {!validationError && status === "error" && <p className="text-sm text-red-500 font-medium">Something went wrong. Please try again.</p>}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Contact;
