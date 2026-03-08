// Avatar option values
export const AVATAR_OPTIONS = {
    topType: [
        'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban',
        'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
        'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly',
        'LongHairCurvy', 'LongHairDreads', 'LongHairFrida', 'LongHairFro',
        'LongHairFroBand', 'LongHairMiaWallace', 'LongHairNotTooLong',
        'LongHairShavedSides', 'LongHairStraight', 'LongHairStraight2',
        'LongHairStraightStrand', 'ShortHairDreads01', 'ShortHairDreads02',
        'ShortHairFrizzle', 'ShortHairShaggyMullet', 'ShortHairShortCurly',
        'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
        'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
    ],
    accessoriesType: [
        'Blank', 'Kurt', 'Prescription01', 'Prescription02',
        'Round', 'Sunglasses', 'Wayfarers',
    ],
    hatColor: [
        'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02',
        'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange',
        'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White',
    ],
    hairColor: [
        'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown',
        'BrownDark', 'PastelPink', 'Blue', 'Platinum', 'Red', 'SilverGray',
    ],
    facialHairType: [
        'Blank', 'BeardMedium', 'BeardLight', 'BeardMajestic',
        'MoustacheFancy', 'MoustacheMagnum',
    ],
    facialHairColor: [
        'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown',
        'BrownDark', 'PastelPink', 'Blue', 'Platinum', 'Red', 'SilverGray',
    ],
    clotheType: [
        'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt',
        'Hoodie', 'Overall', 'ShirtCrewNeck', 'ShirtScoopNeck', 'ShirtVNeck',
    ],
    clotheColor: [
        'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02',
        'Heather', 'PastelBlue', 'PastelGreen', 'PastelOrange',
        'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White',
    ],
    graphicType: [
        'Skull', 'SkullOutline', 'Bat', 'Cumbia', 'Deer',
        'Diamond', 'Hola', 'Selena', 'Pizza', 'Resist', 'Bear',
    ],
    eyeType: [
        'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy',
        'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky',
    ],
    eyebrowType: [
        'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural',
        'RaisedExcited', 'RaisedExcitedNatural', 'SadConcerned',
        'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural',
    ],
    mouthType: [
        'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace',
        'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit',
    ],
    skinColor: [
        'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black',
    ],
} as const

export type AvatarOptionKey = keyof typeof AVATAR_OPTIONS
