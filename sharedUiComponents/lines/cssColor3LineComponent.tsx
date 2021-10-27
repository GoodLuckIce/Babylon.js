import * as React from "react";
import { Observable } from "babylonjs/Misc/observable";
import { PropertyChangedEvent } from "../propertyChangedEvent";
import { NumericInputComponent } from "./numericInputComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Color3 } from 'babylonjs/Maths/math.color';
import { Color4 } from 'babylonjs/Maths/math.color';
import { ColorPickerLineComponent } from './colorPickerComponent';
import { LockObject } from "../tabs/propertyGrids/lockObject";
import { TextInputLineComponent } from "./textInputLineComponent";

const copyIcon: string = require("./copy.svg");

export interface ICssColor3LineComponentProps {
    label: string;
    target: any;
    propertyName: string;
    onPropertyChangedObservable?: Observable<PropertyChangedEvent>;
    icon? : string;
    lockObject?: LockObject;
    iconLabel? : string;
    onValueChange?: (value: string) => void;
}

export class CssColor3LineComponent extends React.Component<ICssColor3LineComponentProps, { isExpanded: boolean, color: Color3, colorText: string }> {
    private _localChange = false;
    constructor(props: ICssColor3LineComponentProps) {
        super(props);

        let colorConverted = this.convertToColor3(this.props.target[this.props.propertyName]);

        this.state = { isExpanded: false, color: colorConverted , colorText: this.props.target[this.props.propertyName]};       
    }

    private convertToColor3(color: string) {

        if(color === "" || color === "transparent"){
            return new Color4(0,0,0,0);
        }

        if (color.substring(0, 1) !== "#" || color.length !== 7) {
            let d = document.createElement("div");
            d.style.color = color;
            document.body.append(d);
            let rgb = window.getComputedStyle(d).color;


            let rgbArray = rgb.substring(4, rgb.length - 1)
                .replace(/ /g, '')
                .split(',');

            console.log(rgb);
            return new Color3(parseInt(rgbArray[0]) / 255, parseInt(rgbArray[1]) / 255, parseInt(rgbArray[2]) / 255);
        }

        var r = parseInt(color.substring(1, 3), 16);
        var g = parseInt(color.substring(3, 5), 16);
        var b = parseInt(color.substring(5, 7), 16);

        return Color3.FromInts(r, g, b);
    }

    shouldComponentUpdate(nextProps: ICssColor3LineComponentProps, nextState: { color: Color3 }) {
        //const currentState = nextProps.target[nextProps.propertyName];

        /*if (!currentState.equals(nextState.color) || this._localChange) {
            nextState.color = currentState.clone();
            this._localChange = false;
            return true;
        }*/
        return true;
    }

    setPropertyValue(newColor: string) {
        this.props.target[this.props.propertyName] = newColor;
    }

    onChange(newValue: string) {
        this._localChange = true;

        const newColor = this.convertToColor3(newValue);

        if (this.props.onPropertyChangedObservable) {
            this.props.onPropertyChangedObservable.notifyObservers({
                object: this.props.target,
                property: this.props.propertyName,
                value: newColor,
                initialValue: this.state.color,
            });
        }

        this.setPropertyValue(newValue);

        this.setState({ color: newColor, colorText: newValue });

        if(this.props.onValueChange) {
            this.props.onValueChange(newValue);
        }
    }

    switchExpandState() {
        this._localChange = true;
        this.setState({ isExpanded: !this.state.isExpanded });
    }

    raiseOnPropertyChanged(previousValue: Color3) {
        if (!this.props.onPropertyChangedObservable) {
            return;
        }
        this.props.onPropertyChangedObservable.notifyObservers({
            object: this.props.target,
            property: this.props.propertyName,
            value: this.state.color,
            initialValue: previousValue,
        });
    }

    updateStateR(value: number) {
        this._localChange = true;

        const store = this.state.color.clone();
        this.state.color.r = value;;
        let hex = this.state.color.toHexString();
        this.setPropertyValue(hex);
        this.setState({ color: this.state.color, colorText: hex });
        this.raiseOnPropertyChanged(store);
    }

    updateStateG(value: number) {
        this._localChange = true;

        const store = this.state.color.clone();
        this.state.color.g = value;

        let hex = this.state.color.toHexString();
        this.setPropertyValue(hex);
        this.setState({ color: this.state.color, colorText: hex });
        this.raiseOnPropertyChanged(store);
    }

    updateStateB(value: number) {
        this._localChange = true;

        const store = this.state.color.clone();
        this.state.color.b = value;
;
        let hex = this.state.color.toHexString();
        this.setPropertyValue(hex);
        this.setState({ color: this.state.color, colorText: hex });
        this.raiseOnPropertyChanged(store);
    }

    copyToClipboard() {
        var element = document.createElement('div');
        element.textContent = this.state.color.toHexString();
        document.body.appendChild(element);

        if (window.getSelection) {
            var range = document.createRange();
            range.selectNode(element);
            window.getSelection()!.removeAllRanges();
            window.getSelection()!.addRange(range);
        }

        document.execCommand('copy');
        element.remove();
    }

    convert(colorString: string) {
        this.onChange(this._colorString);
    }
    
    private _colorString : string;
    render() {

        const chevron = this.state.isExpanded ? <FontAwesomeIcon icon={faMinus} /> : <FontAwesomeIcon icon={faPlus} />;
        this._colorString = this.state.colorText;

        return (
            <div className="color3Line">
                <div className="firstLine" title={this.props.label}>
                {this.props.icon && <img src={this.props.icon} title={this.props.iconLabel} alt={this.props.iconLabel}  className="icon"/>}
                    <div className="label">
                        {this.props.label}
                    </div>
                    <div className="color3">
                        <ColorPickerLineComponent 
                            linearHint={false}
                            value={this.state.color} 
                            onColorChanged={color => {
                            this.onChange(color);

                        }} />                             
                    </div>
                    {(this.props.icon && this.props.lockObject) &&
                    <TextInputLineComponent lockObject={this.props.lockObject} label="" target={this} propertyName="_colorString" onChange={newValue => this.convert(newValue)}
                    onPropertyChangedObservable={this.props.onPropertyChangedObservable} />
                    }
                    <div className="copy hoverIcon" onClick={() => this.copyToClipboard()} title="Copy to clipboard">
                        <img src={copyIcon} alt=""/>
                    </div>
                    <div className="expand hoverIcon" onClick={() => this.switchExpandState()} title="Expand">
                        {chevron}
                    </div>
                </div>
                {
                    this.state.isExpanded &&
                    <div className="secondLine">
                        <NumericInputComponent label="r" value={this.state.color.r} onChange={(value) => this.updateStateR(value)} />
                        <NumericInputComponent label="g" value={this.state.color.g} onChange={(value) => this.updateStateG(value)} />
                        <NumericInputComponent label="b" value={this.state.color.b} onChange={(value) => this.updateStateB(value)} />
                    </div>
                }
            </div>
        );
    }
}
