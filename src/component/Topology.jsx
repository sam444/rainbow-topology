import { Component, UIDialog, UIConfirmDialog } from "rainbowui-core";
import { Util } from 'rainbow-foundation-tools';
import PropTypes from 'prop-types';

export default class Topology extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ignorenodeid: "",
            mind: {}
        }
    }
    render() {
        return (
            <div id={this.props.id}>
                <div id="jsmind_container" ></div>

            </div>
        );
    }
    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.mindInfo, this.state.mind)) {
            let olddata = this.state.mind.data;
            let newdata = nextProps.mindInfo.data;
            let jm = jsMind.current;
            for (let i in newdata) {
                let object = newdata[i];
                let result = this.findnode(object, olddata);
                if (result == "has changed") {//节点内容发生变化
                    jm.remove_node(object.id);
                    jm.add_node(object.parentid, object.id, object.topic);
                    jm.set_node_color(object.id, object.backgroundcolor);
                    console.log("has changed" + object.parentid + ":" + object.id);
                } else if (result == "not found") {//未找到节点 即新增节点
                    console.log("new node" + object.parentid + ":" + object.id);
                    if (object.parentid != 'root') {
                        jm.add_node(object.parentid, object.id, object.topic);
                        jm.set_node_color(object.id, object.backgroundcolor)
                    } else {
                        let node_after = newdata[i - 1].id;
                        jm.insert_node_after(node_after, object.id, object.topic);
                    }
                }
            }
            this.setState({ mind: nextProps.mindInfo });
            if (!_.isEmpty(this.props.buttonevent)) {
                this.props.buttonevent();
            }
        }
    }
    findnode(object, tree) {
        let id = object.id;
        let parentid = object.parentid;
        let topic = object.topic;
        for (let i in tree) {
            if (id == tree[i].id && parentid == tree[i].parentid) {
                if (topic != tree[i].topic) {
                    return "has changed";
                } else {
                    return "the same";
                }
            }
        }
        return "not found";
    }
    componentDidMount() {
        this.changeStyle();
        let mind = this.props.mindInfo;
        this.setState({ mind: mind });
        let options = {
            container: 'jsmind_container',
            editable: true,          // 是否可编辑  
            theme: 'primary',
            support_HTML: true,
            mode: 'side',            // 设置分支只向右。设置为full的时候可向左右伸展 side
            view: {
                line_width: 4,       // 思维导图线条的粗细
                line_color: '#ccc'   // 思维导图线条的颜色
            },
            layout: {
                hspace: 90,          // 节点之间的水平间距
                vspace: 30,          // 节点之间的垂直间距
                pspace: 15           // 节点收缩/展开控制器的尺寸
            }
        };
        let jm = new jsMind(options);
        jm.show(mind);
        let root = jm.get_root();
        jm.select_node(root);
        jm.add_event_listener(function (type, data) {
            if (type === jsMind.event_type.resize) {
                var height = jm.view.size.h;
                var width = jm.view.size.w;
                $('#jsmind_container').height(height);
                $('#jsmind_container').width(width);
            }
        })
        if (!_.isEmpty(this.props.buttonevent)) {
            this.props.buttonevent();
        }
    }
    changeStyle() {
        let container = $('#jsmind_container');
        const { width, height, border, background } = this.props.mindStyle;
        container.css({
            'width': width,
            'height': height,
            'border': border,
            // 'background':background
        })
    }
};


/**
 * Topology component prop types
 */
Topology.propTypes = {
    id: PropTypes.string.isRequired,
    mindInfo: PropTypes.func,
    mindStyle: PropTypes.object
};

/**
 * Get Topology component default props
 */
Topology.defaultProps = {

};