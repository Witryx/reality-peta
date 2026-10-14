import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LeadForm } from "./LeadForm";
import { api } from "@/lib/api";
import { copyKey } from "@/lib/site-copy";
import { WebsiteContentContext } from "@/lib/website-context";
vi.mock("@/lib/api", () => ({ api: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, ...props }: { to: string }) => <a href={to} {...props} />,
}));
afterEach(() => vi.clearAllMocks());

function fillContact() {
  fireEvent.change(screen.getByLabelText("Jméno a příjmení *"), {
    target: { value: "Test formuláře" },
  });
  fireEvent.change(screen.getByLabelText("E-mail *"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText("Zpráva *"), {
    target: { value: "Testovací zpráva pro ověření formuláře." },
  });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Odeslat" }));
}

it("shows the thank-you and social links only after the lead request succeeds", async () => {
  let resolveRequest!: (value: unknown) => void;
  vi.mocked(api).mockReturnValue(
    new Promise((resolve) => {
      resolveRequest = resolve;
    }),
  );
  render(<LeadForm kind="contact" />);
  fillContact();
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await waitFor(() =>
    expect(api).toHaveBeenCalledWith("/api/leads", expect.objectContaining({ method: "POST" })),
  );
  expect(JSON.parse(vi.mocked(api).mock.calls[0]![1]!.body as string)).toMatchObject({
    kind: "contact",
    message: "Testovací zpráva pro ověření formuláře.",
    consent: true,
  });
  resolveRequest({});
  const status = await screen.findByRole("status");
  expect(status).toHaveTextContent("Děkuji za vaši zprávu.");
  expect(status).toHaveTextContent("Můžete mě také najít zde");
  expect(screen.getByRole("link", { name: "Instagram – Petr Pavlát reality" })).toHaveAttribute(
    "href",
    "https://www.instagram.com/petr.pavlat_reality/",
  );
  expect(status).toHaveFocus();
});

it("retains the form and reports a failed lead submission", async () => {
  vi.mocked(api).mockRejectedValue(new Error("Unavailable"));
  render(<LeadForm kind="contact" />);
  fillContact();
  expect(await screen.findByRole("alert")).toHaveTextContent("Odeslání se nepovedlo");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Zpráva *")).toHaveValue("Testovací zpráva pro ověření formuláře.");
});
it("keeps valuation option values stable when the owner changes their labels", async () => {
  vi.mocked(api).mockResolvedValue({});
  render(
    <WebsiteContentContext.Provider value={{ [copyKey("Byt")]: "Bytová jednotka" }}>
      <LeadForm kind="valuation" />
    </WebsiteContentContext.Provider>,
  );
  fireEvent.change(screen.getByLabelText("Jméno a příjmení *"), {
    target: { value: "Test formuláře" },
  });
  fireEvent.change(screen.getByLabelText("E-mail *"), { target: { value: "test@example.cz" } });
  expect(screen.getByRole("option", { name: "Bytová jednotka" })).toHaveValue("Byt");
  fireEvent.change(screen.getByLabelText("Typ *"), { target: { value: "Byt" } });
  fireEvent.change(screen.getByLabelText("Lokalita *"), { target: { value: "Praha" } });
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: /Odeslat/ }));
  await screen.findByRole("status");
  expect(JSON.parse(vi.mocked(api).mock.calls[0]![1]!.body as string)).toMatchObject({
    kind: "valuation",
    property_type: "Byt",
    property_location: "Praha",
  });
});
