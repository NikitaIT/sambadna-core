import { CardRecord } from '../../models';

export interface IEditorProps<TData> {
    card: CardRecord;
    success: (actionType: string, data: any) => void;
    cancel: () => void;
    actionName: string;
    current: TData;
}