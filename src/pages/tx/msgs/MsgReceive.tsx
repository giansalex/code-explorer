import { MsgRecvPacket } from "cosmjs-types/ibc/core/channel/v1/tx";
import React, { Fragment } from "react";

import { AccountLink } from "../../../components/AccountLink";
import { ContractLink } from "../../../components/ContractLink";
import { JsonView } from "../../../components/JsonView";
import { findEventAttributes, findEventType,parseContractEvent, TxLog, TxAttribute, ContractEvent, findEventAttributeValue } from "../../../ui-utils/txs";
import { parseAckResult, parseMsgContract } from "../../../ui-utils";
import { toUtf8 } from "@cosmjs/encoding";

interface Props {
  readonly msg: MsgRecvPacket;
  readonly log: TxLog;
}

export function MsgReceive({ msg, log }: Props): JSX.Element {
  const event = findEventType(log.events, "wasm");
  let internal: ContractEvent[] = [];
  if (event) {
    const evt = parseContractEvent(event.attributes);
    internal = evt.filter(e => e.attributes.find(a => a.key === "action"));
  }

  const instEvent = findEventType(log.events, "instantiate");
  let instContracts: TxAttribute[] = [];
  if (instEvent) {
    instContracts = findEventAttributes(instEvent.attributes, "_contract_address");
  }

  const ack = findEventAttributeValue(log.events, "write_acknowledgement", "packet_ack");

  return (
    <Fragment>
      <li className="list-group-item">
        <span className="font-weight-bold">Source Channel:</span>{" "}
        <span>{msg.packet?.sourceChannel}</span>
      </li>
      <li className="list-group-item">
        <span className="font-weight-bold">Source Port:</span>{" "}
        <span>{msg.packet?.sourcePort}</span>
      </li>
      <li className="list-group-item">
        <span className="font-weight-bold">Dest Channel:</span>{" "}
        <span>{msg.packet?.destinationChannel}</span>
      </li>
      <li className="list-group-item">
        <span className="font-weight-bold">Dest Port:</span>{" "}
        <span>{msg.packet?.destinationPort}</span>
      </li>
      <li className="list-group-item">
        <span className="font-weight-bold">Signer:</span>{" "}
        <AccountLink address={msg.signer} maxLength={null} />
      </li>
      <li className="list-group-item">
        <span title="The contract level message" className="font-weight-bold">
          Packet Data
        </span>
        :
        {msg.packet && <JsonView src={parseMsgContract(msg.packet.data)} strLength={100} />}
      </li>
      <li className="list-group-item">
        <span title="The contract level message" className="font-weight-bold">
          Acknowledgement
        </span>
        :
        {ack && <JsonView src={parseAckResult(toUtf8(ack))} strLength={100} />}
      </li>
      {instContracts.length > 0 && (
        <li className="list-group-item">
          <span title="The contract level message" className="font-weight-bold">
            New contracts:
          </span>
          <p />
          <ul>
            {instContracts.map((e) => (
              <li key={e.value}>
                <ContractLink address={e.value} maxLength={null} />
              </li>
            ))}
          </ul>

        </li>
      )}
      {internal.length > 0 && (
        <li className="list-group-item">
          <span title="The contract level message" className="font-weight-bold">
            Contract calls:
          </span>
          <p />
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Contract</th>
              </tr>
            </thead>
            <tbody>
              {internal.map((e, index) => (
                <tr key={e.contract}>
                  <td>{index + 1}</td>
                  <td>{e.attributes.find(a => a.key === "action")?.value}</td>
                  <td>
                    <ContractLink address={e.contract} maxLength={null} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </li>
      )}
    </Fragment>
  );
}
