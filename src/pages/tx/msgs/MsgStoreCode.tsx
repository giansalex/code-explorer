import "./MsgStoreCode.css";

import { MsgStoreCode as IMsgStoreCode } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toBase64 } from "@cosmjs/encoding";
import React, { Fragment } from "react";

import { AccountLink } from "../../../components/AccountLink";
import { ellideRight } from "../../../ui-utils";
import { getFileType } from "./magic";
import { findEventAttributeValue } from "../../../ui-utils/txs";
import { Log } from "@cosmjs/stargate/build/logs";
import { CodeLink } from "../../../components/CodeLink";

interface Props {
  readonly msg: IMsgStoreCode;
  readonly log: Log;
}

const permissions = ['UNSPECIFIED', 'NOBODY', 'ONLY_ADDRESS', 'EVERYBODY'];

export function MsgStoreCode({ msg, log }: Props): JSX.Element {
  const [showAllCode, setShowAllCode] = React.useState<boolean>(false);

  const codeIdValue = findEventAttributeValue(log.events, "store_code", "code_id");
  const codeId = codeIdValue ? parseInt(codeIdValue) : 0;
  const dataInfo = React.useMemo(() => {
    const data = msg.wasmByteCode ?? new Uint8Array();
    return `${getFileType(data) || "unknown"}; ${data.length} bytes`;
  }, [msg.wasmByteCode]);

  return (
    <Fragment>
      <li className="list-group-item">
        <span className="font-weight-bold">Sender:</span>{" "}
        <AccountLink address={msg.sender ?? "-"} maxLength={null} />
      </li>
      {msg.instantiatePermission && (
        <li className="list-group-item">
          <span className="font-weight-bold">Permission:</span>{" "}
          <span>{permissions[msg.instantiatePermission.permission]}</span>{" "}
          {msg.instantiatePermission.permission === 2 && <AccountLink address={msg.instantiatePermission.address ?? "-"} maxLength={null} />}
        </li>
      )}
      <li className="list-group-item">
        <span className="font-weight-bold">Data:</span> {dataInfo}{" "}
        {!showAllCode ? (
          <Fragment>
            <code>{ellideRight(toBase64(msg.wasmByteCode ?? new Uint8Array()), 300)}</code>{" "}
            <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAllCode(true)}>
              Show all
            </button>
          </Fragment>
        ) : (
          <code className="long-inline-code">{msg.wasmByteCode}</code>
        )}
      </li>
      <li className="list-group-item">
        <span className="font-weight-bold">Code ID:</span>{" "}
        <CodeLink codeId={codeId} text={"#" + codeId} />
      </li>
    </Fragment>
  );
}
