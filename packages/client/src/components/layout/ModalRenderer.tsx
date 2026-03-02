// ──────────────────────────────────────────────
// ModalRenderer: Maps store modal types → components
// ──────────────────────────────────────────────
import { useUIStore } from "../../stores/ui.store";
import { CreateCharacterModal } from "../modals/CreateCharacterModal";
import { ImportCharacterModal } from "../modals/ImportCharacterModal";
import { CreateLorebookModal } from "../modals/CreateLorebookModal";
import { ImportLorebookModal } from "../modals/ImportLorebookModal";
import { CreatePresetModal } from "../modals/CreatePresetModal";
import { ImportPresetModal } from "../modals/ImportPresetModal";

export function ModalRenderer() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);

  const type = modal?.type ?? null;

  return (
    <>
      <CreateCharacterModal  open={type === "create-character"}  onClose={closeModal} />
      <ImportCharacterModal  open={type === "import-character"}  onClose={closeModal} />
      <CreateLorebookModal   open={type === "create-lorebook"}   onClose={closeModal} />
      <ImportLorebookModal   open={type === "import-lorebook"}   onClose={closeModal} />
      <CreatePresetModal     open={type === "create-preset"}     onClose={closeModal} />
      <ImportPresetModal     open={type === "import-preset"}     onClose={closeModal} />
    </>
  );
}
