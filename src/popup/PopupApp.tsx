import { MultimediaResult } from "./MultimediaResult";
import { Navbar } from "./Navbar";
import { OptionsForm } from "./OptionsForm";
import { StatusMessage } from "./StatusMessage";
import { usePopupController } from "./usePopupController";

export const PopupApp = () => {
  const {
    canRandomize,
    onOptionsChange,
    onRandomize,
    onScan,
    options,
    results,
    status,
  } = usePopupController();
  const isScanning = status.type === "starting" || status.type === "scanning";

  return (
    <>
      <Navbar />
      <OptionsForm
        canRandomize={canRandomize}
        isScanning={isScanning}
        onChange={onOptionsChange}
        onRandomize={onRandomize}
        onScan={onScan}
        options={options}
      />

      <StatusMessage status={status} />

      <div className="border-top border-black mt-1 mb-3">
        {results.map((result) => (
          <MultimediaResult key={result.id} result={result} />
        ))}
      </div>
    </>
  );
};
