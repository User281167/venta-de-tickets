import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/components/ui/theme";
import { CartFab } from "../CartFab";

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}

describe("CartFab", () => {
  it("renders with item count badge", () => {
    render(<CartFab itemCount={3} onClick={() => {}} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders without badge when count is 0", () => {
    render(<CartFab itemCount={0} onClick={() => {}} />, {
      wrapper: TestWrapper,
    });

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows 99+ when count exceeds 99", () => {
    render(<CartFab itemCount={150} onClick={() => {}} />, {
      wrapper: TestWrapper,
    });

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<CartFab itemCount={1} onClick={onClick} />, {
      wrapper: TestWrapper,
    });

    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
