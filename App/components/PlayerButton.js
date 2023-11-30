import React from 'react'
import {AntDesign} from '@expo/vector-icons'

const PlayerButton = ({iconType, size=48, iconColor='black', onPress, otherProps}) => {
    const getIconName = (type) => {
        switch (type) {
            case 'PLAY':
                return 'pause'
            case 'PAUSE':
                return 'playcircleo'
            case 'NEXT':
                return 'stepforward'
            case 'PREV':
                return 'stepbackward'
        }
    }
    
    return (
        <AntDesign onPress={onPress} style={{margin: '5%'}} name={getIconName(iconType)} size={size} color={iconColor} {...otherProps}></AntDesign>
    )
}

export default PlayerButton