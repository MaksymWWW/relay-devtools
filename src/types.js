/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

export type WallEvent = {|
  event: string,
  payload: any,
|};
export type Wall = {|
  // `listen` returns the "unlisten" function.
  listen: (fn: Function) => Function,
  sendAll: (Array<WallEvent>) => void,
|};

export type Record = { [key: string]: mixed, ... };
export type DataID = string;
export type UpdatedRecords = { [dataID: DataID]: boolean, ... };

export type StoreRecords = { [DataID]: ?Record, ... };

// Copied from relay
export type LogEvent =
  | {|
      +name: 'queryresource.fetch',
      +operation: $FlowFixMe,
      // FetchPolicy from relay-experimental
      +fetchPolicy: string,
      // RenderPolicy from relay-experimental
      +renderPolicy: string,
      +hasFullQuery: boolean,
      +shouldFetch: boolean,
    |}
  | {|
      +name: 'store.publish',
      +source: any,
      +optimistic: boolean,
    |}
  | {|
      +name: 'store.gc',
      references: Array<DataID>,
      gcRecords: StoreRecords,
    |}
  | {|
      +name: 'store.restore',
    |}
  | {|
      +name: 'store.snapshot',
    |}
  | {|
      +name: 'store.notify.start',
    |}
  | {|
      +name: 'store.notify.complete',
      +updatedRecordIDs: UpdatedRecords,
      +invalidatedRecordIDs: Array<DataID>,
      updatedRecords: StoreRecords,
      invalidatedRecords: StoreRecords,
    |}
  | {|
      +name: 'execute.info' | 'network.info',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      +info: mixed,
      params: $FlowFixMe,
      variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.start' | 'network.start',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      +info: mixed,
      +params: $FlowFixMe,
      +variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.next' | 'network.next',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      +response: $FlowFixMe,
      params: $FlowFixMe,
      variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.error' | 'network.error',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      +error: Error,
      params: $FlowFixMe,
      variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.complete' | 'network.complete',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      params: $FlowFixMe,
      variables: $FlowFixMe,
    |}
  | {|
      +name: 'execute.unsubscribe' | 'network.unsubscribe',
      +transactionID?: ?number,
      +networkRequestId?: ?number,
      params: $FlowFixMe,
      variables: $FlowFixMe,
    |};

export type EventData = {|
  +id: number,
  +data: LogEvent,
  +source: StoreRecords,
  +eventType: string,
|};

export type StoreData = {|
  +name: string,
  +id: number,
  +records: StoreRecords,
|};

export type EnvironmentInfo = {|
  +id: number,
  +environmentName: string,
|};
