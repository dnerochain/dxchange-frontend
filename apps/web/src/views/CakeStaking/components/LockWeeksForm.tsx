import { useTranslation } from '@dneroswap/localization'
import { AutoRow, BalanceInput, BalanceInputProps, Box, Button, FlexGap, Image, Text } from '@dneroswap/uikit'
import { MAX_VEWDNERO_LOCK_WEEKS } from 'config/constants/veWDnero'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { wdneroLockWeeksAtom } from 'state/vewdnero/atoms'
import styled from 'styled-components'
import { useWriteIncreaseLockWeeksCallback } from '../hooks/useContractWrite'
import { useWriteWithdrawCallback } from '../hooks/useContractWrite/useWriteWithdrawCallback'
import { useWDneroLockStatus } from '../hooks/useVeWDneroUserInfo'
import { LockWeeksDataSet } from './DataSet'

const weeks = [
  {
    value: 1,
    label: '1W',
  },
  {
    value: 4,
    label: '1M',
  },
  {
    value: 26,
    label: '6M',
  },
  {
    value: 52,
    label: '1Y',
  },
  {
    value: 208,
    label: '4Y',
  },
]

const ButtonBlocked = styled(Button)`
  flex: 1;
`

const WeekInput: React.FC<{
  value: BalanceInputProps['value']
  onUserInput: BalanceInputProps['onUserInput']
  disabled?: boolean
}> = ({ value, onUserInput, disabled }) => {
  const { t } = useTranslation()
  const onInput = useCallback(
    (v: string) => {
      if (Number(v) > MAX_VEWDNERO_LOCK_WEEKS) {
        onUserInput(String(MAX_VEWDNERO_LOCK_WEEKS))
      } else {
        onUserInput(v)
      }
    },
    [onUserInput],
  )
  const handleWeekSelect = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const { week } = e.currentTarget.dataset
      if (week) {
        onInput(week)
      }
    },
    [onInput],
  )
  return (
    <>
      <BalanceInput
        width="100%"
        inputProps={{
          style: { textAlign: 'left', marginTop: '1px', marginBottom: '1px' },
          disabled,
          max: MAX_VEWDNERO_LOCK_WEEKS,
          pattern: '^[0-9]*$',
        }}
        value={value}
        onUserInput={onInput}
        unit={t('Weeks')}
      />
      {disabled ? null : (
        <FlexGap justifyContent="space-between" flexWrap="wrap" gap="4px" width="100%">
          {weeks.map(({ value: v, label }) => (
            <Button
              key={v}
              data-week={v}
              disabled={disabled}
              onClick={handleWeekSelect}
              scale="sm"
              variant={Number(value) === v ? 'subtle' : 'light'}
            >
              {label}
            </Button>
          ))}
        </FlexGap>
      )}
    </>
  )
}

export const LockWeeksForm: React.FC<{
  fieldOnly?: boolean
  expired?: boolean
  disabled?: boolean
}> = ({ fieldOnly, expired, disabled }) => {
  const { t } = useTranslation()
  const [value, onChange] = useAtom(wdneroLockWeeksAtom)
  return (
    <AutoRow alignSelf="start" gap="16px">
      <FlexGap gap="8px" alignItems="center" height="40px">
        <Box width={40}>
          <Image src="/images/wdnero-staking/lock.png" height={37} width={34} mx="auto" />
        </Box>
        <FlexGap gap="4px">
          <Text color="textSubtle" textTransform="uppercase" fontSize={16} bold>
            {t('add')}
          </Text>
          <Text color="secondary" textTransform="uppercase" fontSize={16} bold>
            {t('duration')}
          </Text>
        </FlexGap>
      </FlexGap>

      <WeekInput value={value} onUserInput={onChange} disabled={disabled} />

      {fieldOnly ? null : (
        <>
          {disabled ? null : <LockWeeksDataSet />}

          {expired ? (
            <FlexGap width="100%" gap="16px">
              <SubmitUnlockButton />
              <SubmitRenewButton />
            </FlexGap>
          ) : (
            <SubmitLockButton disabled={disabled} />
          )}
        </>
      )}
    </AutoRow>
  )
}

const SubmitLockButton = ({ disabled }) => {
  const { t } = useTranslation()
  const wdneroLockWeeks = useAtomValue(wdneroLockWeeksAtom)
  const _disabled = useMemo(() => !wdneroLockWeeks || wdneroLockWeeks === '0' || disabled, [wdneroLockWeeks, disabled])
  const increaseLockWeeks = useWriteIncreaseLockWeeksCallback()

  return (
    <Button disabled={_disabled} width="100%" onClick={increaseLockWeeks}>
      {t('Extend Lock')}
    </Button>
  )
}

const SubmitUnlockButton = () => {
  const { t } = useTranslation()
  const unlock = useWriteWithdrawCallback()
  const { wdneroLockedAmount } = useWDneroLockStatus()

  if (!wdneroLockedAmount) {
    return null
  }

  return (
    <ButtonBlocked variant="secondary" onClick={unlock}>
      {t('Unlock')}
    </ButtonBlocked>
  )
}

const SubmitRenewButton = () => {
  const { t } = useTranslation()
  const wdneroLockWeeks = useAtomValue(wdneroLockWeeksAtom)
  const disabled = useMemo(() => !wdneroLockWeeks || Number(wdneroLockWeeks) <= 0, [wdneroLockWeeks])

  const renew = useWriteIncreaseLockWeeksCallback()

  return (
    <ButtonBlocked disabled={disabled} onClick={renew}>
      {' '}
      {t('Renew Lock')}{' '}
    </ButtonBlocked>
  )
}
