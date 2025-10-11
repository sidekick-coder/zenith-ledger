import Base from '#ledger/shared/entities/entry.entity.ts'
import { Model } from '#server/mixins/model.mixin.ts'
import { composeWith } from '#shared/utils/compose.ts'

export default class Entry extends composeWith(
    Base, 
    Model('ledger__entries')
) {

}