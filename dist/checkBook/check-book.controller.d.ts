import { CheckBookService } from "./check-book.service";
export declare class CheckBookController {
    private readonly checkBookService;
    constructor(checkBookService: CheckBookService);
    findAll(): Promise<{
        branchId: string | null;
        id: string;
        amount: number;
        chequeNumber: string | null;
        chequeBank: string | null;
        chequeDueDate: Date | null;
        available: boolean | null;
        chequeReceived: Date | null;
    }[]>;
    deleteCheckBook(payload: any): Promise<{
        branchId: string | null;
        id: string;
        amount: number;
        chequeNumber: string | null;
        chequeBank: string | null;
        chequeDueDate: Date | null;
        available: boolean | null;
        chequeReceived: Date | null;
    } | {
        message: string;
    }>;
}
