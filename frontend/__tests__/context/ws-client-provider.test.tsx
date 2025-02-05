import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as ChatSlice from "#/state/chat-slice";
import {
  updateStatusWhenErrorMessagePresent,
} from "#/context/ws-client-provider";

describe("Propagate error message", () => {
  it("should do nothing when no message was passed from server", () => {
    const addErrorMessageSpy = vi.spyOn(ChatSlice, "addErrorMessage");
    updateStatusWhenErrorMessagePresent(null)
    updateStatusWhenErrorMessagePresent(undefined)
    updateStatusWhenErrorMessagePresent({})
    updateStatusWhenErrorMessagePresent({message: null})

    expect(addErrorMessageSpy).not.toHaveBeenCalled();
  });

  it("should display error to user when present", () => {
    const message = "We have a problem!"
    const addErrorMessageSpy = vi.spyOn(ChatSlice, "addErrorMessage")
    updateStatusWhenErrorMessagePresent({message})

    expect(addErrorMessageSpy).toHaveBeenCalledWith({
      message,
      content: message,
      type: 'error',
      sender: 'assistant',
      timestamp: expect.any(String)
     });
  });

  it("should display error including translation id when present", () => {
    const message = "We have a problem!"
    const addErrorMessageSpy = vi.spyOn(ChatSlice, "addErrorMessage")
    updateStatusWhenErrorMessagePresent({message, data: {msg_id: '..id..'}})

    expect(addErrorMessageSpy).toHaveBeenCalledWith({
      message,
      content: message,
      id: '..id..',
      type: 'error',
      sender: 'assistant',
      timestamp: expect.any(String)
     });
  });
});
