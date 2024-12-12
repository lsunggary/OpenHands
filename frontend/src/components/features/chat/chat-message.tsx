import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { code } from "../markdown/code";
import { cn } from "#/utils/utils";
import { ul, ol } from "../markdown/list";
import { CopyToClipboardButton } from "#/components/shared/buttons/copy-to-clipboard-button";
import { RootState } from "#/store";

// Function to speak text using Web Speech API
function speakText(text: string) {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);

  // Get available voices and set a good English voice if available
  let voices = window.speechSynthesis.getVoices();
  console.log('Available voices:', voices);
  
  // If voices array is empty, wait for the voiceschanged event
  if (voices.length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      voices = window.speechSynthesis.getVoices();
      console.log('Voices after change:', voices);
      const englishVoice =
        voices.find(
          (voice) => voice.lang.startsWith("en") && voice.name.includes("Google"),
        ) || voices.find((voice) => voice.lang.startsWith("en"));

      if (englishVoice) {
        console.log('Selected voice:', englishVoice);
        utterance.voice = englishVoice;
      } else {
        console.log('No English voice found');
      }

      // Set properties
      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume

      // Speak the text
      console.log('Speaking text:', text);
      window.speechSynthesis.speak(utterance);
    }, { once: true });
  } else {
    const englishVoice =
      voices.find(
        (voice) => voice.lang.startsWith("en") && voice.name.includes("Google"),
      ) || voices.find((voice) => voice.lang.startsWith("en"));

    if (englishVoice) {
      console.log('Selected voice:', englishVoice);
      utterance.voice = englishVoice;
    } else {
      console.log('No English voice found');
    }

    // Set properties
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Speak the text
    console.log('Speaking text:', text);
    window.speechSynthesis.speak(utterance);
  }
}

interface ChatMessageProps {
  type: "user" | "assistant";
  message: string;
}

export function ChatMessage({
  type,
  message,
  children,
}: React.PropsWithChildren<ChatMessageProps>) {
  const [isHovering, setIsHovering] = React.useState(false);
  const [isCopy, setIsCopy] = React.useState(false);

  const handleCopyToClipboard = async () => {
    await navigator.clipboard.writeText(message);
    setIsCopy(true);
  };

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCopy) {
      timeout = setTimeout(() => {
        setIsCopy(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopy]);

  // Get speech enabled state from Redux
  const speechEnabled = useSelector((state: RootState) => state.speech.enabled);
  console.log('Speech enabled state:', speechEnabled);

  // Speak assistant messages when they appear
  React.useEffect(() => {
    console.log('Effect triggered. Speech enabled:', speechEnabled, 'Type:', type, 'Message:', message ? 'exists' : 'none');
    if (speechEnabled && type === "assistant" && message) {
      // Remove markdown formatting before speaking
      const plainText = message.replace(/[#*`]/g, "");
      console.log('Speaking message:', plainText);
      speakText(plainText);
    }
  }, [type, message, speechEnabled]);

  return (
    <article
      data-testid={`${type}-message`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "rounded-xl relative",
        "flex flex-col gap-2",
        type === "user" && " max-w-[305px] p-4 bg-neutral-700 self-end",
        type === "assistant" && "mt-6 max-w-full bg-tranparent",
      )}
    >
      <CopyToClipboardButton
        isHidden={!isHovering}
        isDisabled={isCopy}
        onClick={handleCopyToClipboard}
        mode={isCopy ? "copied" : "copy"}
      />
      <Markdown
        className="text-sm overflow-auto"
        components={{
          code,
          ul,
          ol,
        }}
        remarkPlugins={[remarkGfm]}
      >
        {message}
      </Markdown>
      {children}
    </article>
  );
}
