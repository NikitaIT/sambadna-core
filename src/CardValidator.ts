import { CardRecord } from "./models";

export class CardValidator {
    public validate(card: CardRecord): CardRecord {
        if (card.isClosed && card.balance !== 0) {
            card = card.addValidationIssue("There is an issue with the card balance");
        }
        return card;
    }
}

export default new CardValidator();