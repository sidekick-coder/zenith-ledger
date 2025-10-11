<script setup lang="ts">
import { watch, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { ComponentExposed } from 'vue-component-type-helpers'
import DataTable, { defineColumns } from '#client/components/DataTable.vue'
import { $t } from '#shared/lang.ts'
import AppLayout from '#client/layouts/AppLayout.vue'
import { $fetch } from '#client/utils/fetcher.ts'
import Button from '#client/components/Button.vue'
import Icon from '#client/components/Icon.vue'
import AlertButton from '#client/components/AlertButton.vue'
import DialogForm, { defineFormFields } from '#client/components/DialogForm.vue'
import * as schemas from '#ledger/shared/validators/index.ts'
import Account from '#ledger/shared/entities/account.entity.ts'
import Entry from '#ledger/shared/entities/entry.entity.ts'
import PageTitle from '#client/components/PageTitle.vue'
import PageSubtitle from '#client/components/PageSubtitle.vue'

const page = ref(1)
const loading = ref(false)
const tableRef = ref<ComponentExposed<typeof DataTable>>()
const deletingItems = ref<number[]>([])

const columns = defineColumns<Entry>([
    {
        id: 'id',
        label: 'ID',
        field: 'id',
        width: 50,
    },
    {
        id: 'account',
        label: $t('Account'),
    },
    {
        id: 'type',
        label: $t('Type'),
        field: row => row.typeLabel,
    },
    { id: 'actions' }
])

const fields = defineFormFields({
    account_id: {
        component: 'autocomplete',
        label: $t('Account'),
        fetch: '/api/ledger/accounts?limit=5',
        fetchOption: (o: any) => $fetch(`/api/ledger/accounts/${o}`),
        labelKey: 'name',
        valueKey: 'id',
        clearable: true,
    },
    description: {
        component: 'text-field',
        label: $t('Description'),
    },
    type: {
        component: 'select',
        label: $t('Type'),
        options: Entry.TYPES,
    },
    amount: {
        component: 'text-field',
        label: $t('Amount'),
        min: 0,
        step: 0.01,
        type: 'number',
    },
})

function load(){
    tableRef.value?.load()
}

function reset() {
    page.value = 1
    return load()
}

async function destroy(id: Account['id']) {
    deletingItems.value.push(id)

    const [error] = await $fetch.try(`/api/ledger/entries/${id}`, { method: 'DELETE', })

    if (error) {
        toast.error($t('Failed to delete.'))
        deletingItems.value = []
        return
    }

    setTimeout(() => {
        toast.success($t('Deleted successfully.'))
        reset()
    }, 1000)
}

watch(page, load, { immediate: true })
</script>
<template>
    <AppLayout>
        <div class="flex">
            <div class="mb-4 flex-1">
                <PageTitle>{{ $t('Entries') }}</PageTitle>
                <PageSubtitle>{{ $t('Manage your ledger entries.') }}</PageSubtitle>
            </div>

            <div class="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="load"
                >
                    <Icon
                        name="RotateCcw"
                        :class="{ 'animate-spin': loading }"
                    />
                </Button>
                <DialogForm 
                    fetch="/api/ledger/entries"
                    :title="$t('Add new entry')"
                    :description="$t('Fill in the details below to add a new entry')"
                    :schema="schemas.entry.create"
                    :fields="fields"
                    @submit="load"
                >
                    <Button :disabled="loading">
                        {{ $t('Add new') }}
                    </Button>
                </DialogForm>
            </div>
        </div>

        <DataTable
            ref="tableRef"
            v-model:loading="loading"
            fetch="/api/ledger/entries"
            :serialize="row => Entry.from(row)"
            :columns="columns"
        >
            <template #row-actions="{ row }">
                <div class="flex items-center gap-2 justify-end">
                    <DialogForm 
                        :title="$t('Edit an entry')"
                        :description="$t('Update the details of the entry')"
                        :fetch="`/api/ledger/entries/${row.id}`"
                        :method="'PUT'"
                        :values="row"
                        :schema="schemas.entry.update"
                        :fields="fields"
                        @submit="load"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                        >
                            <Icon name="edit" />
                        </Button>
                    </DialogForm>

                    <AlertButton 
                        variant="ghost"
                        size="sm"
                        :loading="deletingItems.includes(row.id)"
                        @confirm="destroy(row.id)"
                    >
                        <Icon name="trash" />
                    </AlertButton>
                </div>
            </template>
        </DataTable>
    </AppLayout>
</template>
